const { supabase, supabaseAdmin } = require('../db');
const { sendPasswordSetupLinkEmail, sendPasswordResetEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to upload file to Supabase Storage
const uploadFile = async (file, folderPath, bucket = 'Images_Personal_detail') => {
    if (!file) return null;

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    // Use the provided folder path (e.g. partners/email_phone/)
    const filePath = `${folderPath}/${fileName}`;

    /* 
       Note: We assume the bucket 'Images_Personal_detail' exists.
       If not, we try legacy fallback internally if the upload fails.
    */

    const { data, error } = await supabaseAdmin
        .storage
        .from(bucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        console.error('Storage Upload Error:', error);
        if (bucket === 'Images_Personal_detail') {
            console.log('Retrying with legacy bucket name...');
            return uploadFile(file, folderPath, 'Images_Personal_deatail');
        }
        throw new Error('Failed to upload document');
    }

    const { data: publicURLData } = supabaseAdmin
        .storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicURLData.publicUrl;
};

const setAuthCookies = (res, session) => {
    // Max age: 7 days
    res.cookie('sb_access_token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('sb_refresh_token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// 1. Register: Create User (in public.users) -> Uploads -> DB Insert (Pending/Resubmitted)
exports.registerPartner = async (req, res) => {
    let userId = null;

    try {
        const {
            email, orgName, phone,
            panName, panNumber,
            vatNumber,
            bankName, branch, accountName, accountNumber,
            backupName, backupPhone, backupEmail,
            acceptedTerms
        } = req.body;

        const safeFolder = `partners/${email.replace(/[^a-zA-Z0-9]/g, '_')}_${phone.replace(/[^a-zA-Z0-9]/g, '')}`;

        // STEP 1: Duplicate Checks (PAN, VAT, Email)
        // We need to check if any EXISTING partner has these details (excluding 'rejected' unless we are resubmitting that same one)

        const { data: conflicts, error: conflictError } = await supabaseAdmin
            .from('partners')
            .select('id, user_id, status, official_email, pan_number, vat_number')
            .or(`official_email.eq.${email},pan_number.eq.${panNumber},vat_number.eq.${vatNumber}`);

        if (conflictError) {
            console.error('Check Conflict Error:', conflictError);
            return res.status(500).json({ error: 'Validation failed.' });
        }

        let existingPartnerToResubmit = null;

        if (conflicts && conflicts.length > 0) {
            for (const p of conflicts) {
                // Check exact email match (Resubmission Candidate)
                if (p.official_email === email) {
                    if (p.status === 'rejected') {
                        existingPartnerToResubmit = p;
                        continue; // Allow resubmission
                    } else {
                        // If pending, approved, or resubmitted -> Block
                        return res.status(400).json({ error: 'This email is already registered and is under review or approved.' });
                    }
                }

                // Check PAN conflict (different partner)
                if (p.pan_number === panNumber && p.official_email !== email) {
                    return res.status(400).json({ error: 'This PAN number is already registered with another account.' });
                }

                // Check VAT conflict (different partner)
                if (vatNumber && p.vat_number === vatNumber && p.official_email !== email) {
                    return res.status(400).json({ error: 'This VAT number is already registered with another account.' });
                }
            }
        }

        // Logic Branch: RESUBMISSION (Update Existing) vs NEW REGISTRATION (Create New)

        if (existingPartnerToResubmit) {
            console.log(`Processing Resubmission for: ${email}`);
            userId = existingPartnerToResubmit.user_id; // Reuse existing user

            // Handle File Uploads (Only if new files provided, otherwise keep old or null? Frontend usually sends all)
            // Assuming frontend sends files if they are changed or re-uploaded.
            let panPhotoUrl = null;
            let vatPhotoUrl = null;

            // Note: In resubmission, if no file is sent, we might want to keep existing? 
            // For now, let's update if provided.
            if (req.files) {
                if (req.files.panPhoto) panPhotoUrl = await uploadFile(req.files.panPhoto[0], safeFolder);
                if (req.files.vatPhoto) vatPhotoUrl = await uploadFile(req.files.vatPhoto[0], safeFolder);
            }

            let updates = {
                organization_name: orgName,
                official_phone: phone,
                pan_holder_name: panName,
                pan_number: panNumber,
                vat_number: vatNumber,
                bank_name: bankName,
                bank_branch: branch,
                account_holder_name: accountName,
                account_number: accountNumber,
                backup_contact_name: backupName,
                backup_contact_phone: backupPhone,
                backup_contact_email: backupEmail,
                terms_accepted: acceptedTerms === 'true' || acceptedTerms === true,
                status: 'resubmitted', // NEW STATUS
                rejection_reason: null // Clear reason
            };

            if (panPhotoUrl) updates.pan_photo_url = panPhotoUrl;
            if (vatPhotoUrl) updates.vat_photo_url = vatPhotoUrl;

            const { error: updateError } = await supabaseAdmin
                .from('partners')
                .update(updates)
                .eq('id', existingPartnerToResubmit.id);

            if (updateError) {
                console.error('Resubmit Update Error:', updateError);
                return res.status(500).json({ error: 'Failed to resubmit application.' });
            }

            return res.status(200).json({
                message: 'Application resubmitted successfully.',
                success: true
            });

        } else {
            // NEW REGISTRATION

            // Check existing user in public.users (Auth level check)
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single();

            if (existingUser) {
                // If user exists but no partner record found (weird state), or partner was deleted?
                // Or maybe they are a different role?
                // Logic above handled 'partners' check. If user exists but not in partners (e.g. admin?), block.
                return res.status(400).json({ error: 'This email is already registered.' });
            }

            // Create User in public.users
            const passwordHash = await bcrypt.hash(crypto.randomBytes(20).toString('hex'), 10); // Temp random hash
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    full_name: orgName, // Use Org Name as initial name
                    email: email.toLowerCase(),
                    password_hash: passwordHash,
                    is_verified: false
                })
                .select()
                .single();

            if (userError || !newUser) {
                console.error('Create User Error:', userError);
                return res.status(500).json({ error: 'Failed to create user account.' });
            }

            userId = newUser.id;

            // Upload Files
            let panPhotoUrl = null;
            let vatPhotoUrl = null;

            try {
                if (req.files) {
                    if (req.files.panPhoto) panPhotoUrl = await uploadFile(req.files.panPhoto[0], safeFolder);
                    if (req.files.vatPhoto) vatPhotoUrl = await uploadFile(req.files.vatPhoto[0], safeFolder);
                }
            } catch (uploadError) {
                console.error('Upload Error:', uploadError);
                await supabaseAdmin.from('users').delete().eq('id', userId); // ROLLBACK
                return res.status(500).json({ error: 'Failed to upload documents.' });
            }

            // Insert into Partners Table
            const { error: dbError } = await supabaseAdmin
                .from('partners')
                .insert([{
                    user_id: userId,
                    organization_name: orgName,
                    official_email: email,
                    official_phone: phone,
                    pan_holder_name: panName,
                    pan_number: panNumber,
                    pan_photo_url: panPhotoUrl,
                    vat_number: vatNumber,
                    vat_photo_url: vatPhotoUrl,
                    bank_name: bankName,
                    bank_branch: branch,
                    account_holder_name: accountName,
                    account_number: accountNumber,
                    backup_contact_name: backupName,
                    backup_contact_phone: backupPhone,
                    backup_contact_email: backupEmail,
                    terms_accepted: acceptedTerms === 'true' || acceptedTerms === true,
                    status: 'pending',
                    must_set_password: true
                }]);

            if (dbError) {
                console.error('Partner Insert Error:', dbError);
                await supabaseAdmin.from('users').delete().eq('id', userId); // ROLLBACK
                return res.status(500).json({ error: 'Failed to save application.' });
            }

            res.status(201).json({
                message: 'Application submitted successfully.',
                success: true
            });
        }

    } catch (err) {
        // Rollback new user if strictly new
        // Note: Logic is complex for rollback if we reused user. 
        // We only rollback if we *created* the user in this request.
        // Simplified: The try/catch blocks above handle specific rollbacks.
        // This outer catch is for unexpected crashes.
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin Approve Partner: Verify -> Set Temp Pass -> Send Email
// Admin Approve Partner: Verify -> Generate Token -> Send Email
exports.approvePartner = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const { data: partner, error: findError } = await supabaseAdmin
            .from('partners')
            .select('id, user_id, organization_name')
            .eq('official_email', email)
            .single();

        if (findError || !partner) return res.status(404).json({ error: 'Partner not found' });

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours for better DX

        // Insert into partner_password_tokens (New Table)
        const { error: tokenError } = await supabaseAdmin
            .from('partner_password_tokens')
            .insert({
                partner_id: partner.id,
                user_id: partner.user_id,
                token: token,
                expires_at: expiresAt.toISOString()
            });

        if (tokenError) {
            console.error('Token Error:', tokenError);
            return res.status(500).json({ error: 'Failed to create secure token.' });
        }

        // Update Partner Status
        await supabaseAdmin
            .from('partners')
            .update({ status: 'approved', must_set_password: true })
            .eq('id', partner.id);

        // Verify user in public.users
        await supabaseAdmin
            .from('users')
            .update({ is_verified: true })
            .eq('id', partner.user_id);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const link = `${frontendUrl}/partner/change-password?token=${token}`;

        console.log('---------------------------------------------------');
        console.log(`✅ Partner Approved: ${email}`);
        console.log(`🔗 SETUP LINK: ${link}`);
        console.log('---------------------------------------------------');

        await sendPasswordSetupLinkEmail(email, link);

        res.json({ message: 'Partner approved. Setup link sent.' });

    } catch (err) {
        console.error('Approve Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin Reject Partner
exports.rejectPartner = async (req, res) => {
    try {
        const { email, reason } = req.body;
        if (error) throw error;

        // Automatically generate resubmission link
        // const { link } = await exports.generateResubmissionLinkInternal(email);
        // await sendRejectionEmail(email, reason, link); // Optional

        res.json({ message: `Partner ${email} rejected.` });
    } catch (err) {
        console.error('Reject Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin Generate Resubmission Link
exports.generateResubmissionLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const { error } = await supabaseAdmin
            .from('otps')
            .insert({
                email,
                code: token,
                purpose: 'resubmission',
                expires_at: expiresAt
            });

        if (error) throw error;

        const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/partner/register?token=${token}`;

        res.json({ link });

    } catch (err) {
        console.error('Generate Link Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Get Pending Partners
exports.getPendingPartners = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('partners')
            .select('*')
            .eq('status', 'pending');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Get Pending Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Application Data by Token (for Resubmission)
exports.getApplicationData = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token required' });

        // Verify Token
        const { data: otp, error: otpError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('code', token)
            .eq('purpose', 'resubmission')
            .gt('expires_at', new Date().toISOString())
            .single();

        if (otpError || !otp) return res.status(400).json({ error: 'Invalid or expired link.' });

        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('*')
            .eq('official_email', otp.email)
            .single();

        if (pError || !partner) return res.status(404).json({ error: 'Partner data not found.' });

        res.json(partner);

    } catch (err) {
        console.error('Get App Data Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Resubmit Rejected Application
exports.resubmitPartner = async (req, res) => {
    try {
        const {
            token, // Require token for security
            email, orgName, phone,
            panName, panNumber,
            vatNumber,
            bankName, branch, accountName, accountNumber,
            backupName, backupPhone, backupEmail,
            acceptedTerms
        } = req.body;

        if (!token) return res.status(400).json({ error: 'Resubmission token required.' });

        // Verify Token
        const { data: otp, error: otpError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('code', token)
            .eq('purpose', 'resubmission')
            // Verify it matches the email being submitted
            .eq('email', email)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (otpError || !otp) return res.status(403).json({ error: 'Invalid or expired resubmission token.' });

        // Find existing partner to verify they exist and are rejected/pending
        // Note: For resubmission, we expect the partner to already exist
        const { data: existing, error: findError } = await supabaseAdmin
            .from('partners')
            .select('user_id, status')
            .eq('official_email', email)
            .single();

        if (findError || !existing) return res.status(404).json({ error: 'Application not found for resubmission.' });

        const safeFolder = `partners/${email.replace(/[^a-zA-Z0-9]/g, '_')}_${phone.replace(/[^a-zA-Z0-9]/g, '')}`;

        // Handle File Uploads ONLY if new files are provided
        let updates = {
            organization_name: orgName,
            official_phone: phone,
            pan_holder_name: panName,
            pan_number: panNumber,
            vat_number: vatNumber,
            bank_name: bankName,
            bank_branch: branch,
            account_holder_name: accountName,
            account_number: accountNumber,
            backup_contact_name: backupName,
            backup_contact_phone: backupPhone,
            backup_contact_email: backupEmail,
            terms_accepted: acceptedTerms === 'true' || acceptedTerms === true,
            status: 'pending', // RESET STATUS
            rejection_reason: null // CLEAR REASON
        };

        if (req.files) {
            if (req.files.panPhoto) {
                updates.pan_photo_url = await uploadFile(req.files.panPhoto[0], safeFolder);
            }
            if (req.files.vatPhoto) {
                updates.vat_photo_url = await uploadFile(req.files.vatPhoto[0], safeFolder);
            }
        }

        const { error: updateError } = await supabaseAdmin
            .from('partners')
            .update(updates)
            .eq('official_email', email);

        if (updateError) throw updateError;

        // Invalidate Token
        await supabaseAdmin.from('otps').delete().eq('id', otp.id);

        res.json({ message: 'Application resubmitted successfully.' });

    } catch (err) {
        console.error('Resubmit Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 2. Login with Force Change Password Check
// 2. Login Logic (Custom)
exports.loginPartner = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check User in public.users
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (userError || !user) {
            console.log('Login failed: User not found', email);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log('Login failed: Password mismatch', email);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 3. Check Partner Status
        const { data: partner, error: partnerError } = await supabaseAdmin
            .from('partners')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (partnerError || !partner) {
            return res.status(403).json({ error: 'Partner account not found.' });
        }

        if (partner.status === 'rejected') {
            return res.status(403).json({ error: `Account rejected: ${partner.rejection_reason}` });
        }

        if (partner.status === 'pending') {
            return res.status(403).json({ error: 'Account is under review.' });
        }

        if (partner.must_set_password) {
            return res.status(403).json({ error: 'Please check your email to set your password.' });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'partner' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set Cookie (Optional, if using custom middleware)
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: 'Login successful',
            token, // Return token for localStorage
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                orgName: partner.organization_name
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// 3. Send Password Change OTP (Using Custom OTPs Table)
exports.sendPasswordOtp = async (req, res) => {
    try {
        // This call seems redundant if we are doing customized logic in forgotPassword
        // but typically 'sendPasswordOtp' might be the same as 'forgotPassword'
        // routing calls 'forgotPassword' for the initial request.
        // Reuse forgotPassword implementation or redirect logic.
        return exports.forgotPassword(req, res);

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 4. Verify OTP and Change Password (Using Custom OTPs Table)
exports.verifyChangePassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP from Custom Table
        const { data: otpRecord, error: otpError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('email', email)
            .eq('code', otp) // Ensure code matches
            .gt('expires_at', new Date().toISOString()) // Ensure not expired
            .single();

        if (otpError || !otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        // OTP is valid. Now find the User ID (Partner) from Partners table or Auth
        // Since we have email, we can find the user via Admin API or Partners table
        const { data: partnerData, error: uError } = await supabaseAdmin
            .from('partners')
            .select('user_id')
            .eq('official_email', email)
            .single();

        if (uError || !partnerData) return res.status(404).json({ error: 'User not found.' });

        const userId = partnerData.user_id;

        // Hash the new password for Partners table
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update Password and Metadata in Supabase Auth
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            {
                password: newPassword
            }
        );

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        // Update Partners Table
        await supabaseAdmin.from('partners')
            .update({ password: hashedPassword })
            .eq('user_id', userId);

        // Delete used OTP
        await supabaseAdmin.from('otps').delete().eq('id', otpRecord.id);

        res.json({ message: 'Password updated successfully. You can now login.' });

    } catch (err) {
        console.error('Verify Change Password Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Legacy exports mostly unused now but kept for compatibility or admin usage if needed
exports.verifyOtp = async (req, res) => {
    // Kept for backward compatibility if any other flow uses it
    return res.status(404).json({ error: 'Deprecated Endpoint' });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists first
        const { data: partner, error: findError } = await supabaseAdmin
            .from('partners')
            .select('id')
            .eq('official_email', email)
            .single();

        if (findError || !partner) return res.status(404).json({ error: 'Email not found.' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Insert into OTPs table
        const { error: insertError } = await supabaseAdmin
            .from('otps')
            .insert([{
                email: email,
                code: otp,
                expires_at: expiresAt.toISOString(),
                purpose: 'password_reset'
            }]);

        if (insertError) {
            console.error('OTP Insert Error:', insertError);
            return res.status(500).json({ error: 'Failed to generate OTP.' });
        }

        // Send Custom Email
        await sendPasswordResetEmail(email, otp);

        res.json({ message: 'Password recovery OTP sent.' });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePassword = async (req, res) => {
    // This is for logged-in users changing password via settings
    try {
        const { password } = req.body;

        // 1. Update Auth
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) return res.status(400).json({ error: error.message });

        // 2. Update Partners Table (Sync Hash)
        // Get current user ID from request (set by middleware)
        const user = data.user;
        // Note: supabase.auth.updateUser only updates the current user context if using supabase-js client side, 
        // but here 'supabase' is initialized with anon key or service key?
        // If we are using the 'supabase' client from db.js, we need to know IF it has context.
        // Usually, middleware sets req.user.
        // But to be safe, we should use req.user.id if available.
        // Assuming 'requireAuth' sets req.user

        // Wait, 'supabase.auth.updateUser' works on the *current session*. 
        // Backend doesn't hold session for specific user unless set.
        // If we use 'supabaseAdmin.auth.admin.updateUserById', it's safer.

        // Let's use Admin API with ID from request
        // Verify user is attached?
        // 'requireAuth' is likely used. We should check if req.user exists.
        // If 'updatePassword' was calling 'supabase.auth.updateUser', it implies 'supabase' might have been set up with the user's token?
        // Let's check db.js. 
        // Standard pattern: pass token to supabase client or use admin.

        // Safest approach: Use Admin API with req.user.id (from middleware)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.user.id;

        // Hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update Auth
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        if (authError) return res.status(400).json({ error: authError.message });

        // Update DB
        const { error: dbError } = await supabaseAdmin
            .from('partners')
            .update({ password: hashedPassword })
            .eq('user_id', userId);

        if (dbError) console.error('DB Sync Error:', dbError); // Don't block

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        await supabase.auth.signOut();
        res.clearCookie('sb_access_token');
        res.clearCookie('sb_refresh_token');
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error logging out' });
    }
};

// NEW: Setup Password via Token (Public Endpoint)
// Setup Password via Token (Custom Table)
exports.setupPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) return res.status(400).json({ error: 'Invalid Request.' });

        console.log(`SetupPassword Attempt. Token: ${token}`);

        // 1. Verify Token - FIRST Check strict match
        let { data: tokenData, error: tokenError } = await supabaseAdmin
            .from('partner_password_tokens')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        // 2. If not found by token, check if user provided the ID by mistake (DX improvement)
        if (!tokenData) {
            const { data: idData } = await supabaseAdmin
                .from('partner_password_tokens')
                .select('*')
                .eq('id', token)
                .maybeSingle();

            if (idData) {
                console.log('User provided ID instead of Token. Retrieving correct token for logic...');
                return res.status(400).json({ error: 'Invalid token. (Diagnostic: You might be using the ID instead of the Token. Check your link.)' });
            }
        }

        if (tokenError || !tokenData) {
            console.log('Token not found in DB.');
            return res.status(400).json({ error: 'Invalid setup token.' });
        }

        // 3. Check Expiry
        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(400).json({ error: 'This setup link has expired. Please ask Admin to resend.' });
        }

        // 4. Check Used
        if (tokenData.used) {
            return res.status(400).json({ error: 'This link has already been used.' });
        }

        // 5. Hash Password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // 6. Update public.users
        const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({
                password_hash: hashedPassword,
                is_verified: true
            })
            .eq('id', tokenData.user_id);

        if (userUpdateError) throw userUpdateError;

        // 7. Update partners (clear flag)
        await supabaseAdmin
            .from('partners')
            .update({ must_set_password: false })
            .eq('id', tokenData.partner_id);

        // 8. Delete Used Token (User requested deletion instead of marking used)
        await supabaseAdmin
            .from('partner_password_tokens')
            .delete()
            .eq('id', tokenData.id);

        res.json({ message: 'Password set successfully. Please login.' });

    } catch (err) {
        console.error('Setup Password Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
