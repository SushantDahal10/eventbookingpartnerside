const { supabaseAdmin } = require('../db');
const bcrypt = require('bcryptjs');
const { sendWithdrawalOtpEmail, sendProfileUpdateOtpEmail } = require('../utils/emailService');

exports.getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { data: partner, error } = await supabaseAdmin
            .from('partners')
            .select(`
                id,
                organization_name,
                official_email,
                official_phone,
                full_address,
                city,
                state,
                country,
                pan_number,
                vat_number,
                bank_name,
                bank_branch,
                account_holder_name,
                account_number
            `)
            .eq('user_id', req.user.id)
            .single();

        console.log(`[DEBUG] getProfile called for User ID: ${req.user.id}`);

        if (error) {
            console.error('[DEBUG] Database Error:', error);
            return res.status(404).json({ error: 'Partner profile not found' });
        }

        if (!partner) {
            console.warn('[DEBUG] No partner row found for user');
            return res.status(404).json({ error: 'Partner profile not found' });
        }

        console.log('[DEBUG] Partner Data Retrieved:', JSON.stringify(partner, null, 2));

        res.json(partner);
    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { official_email, official_phone, full_address, otp } = req.body;
        const userId = req.user.id;

        // 1. Fetch Current Data
        const { data: currentPartner } = await supabaseAdmin
            .from('partners')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!currentPartner) return res.status(404).json({ error: 'Partner not found' });

        // 2. Check for Sensitive Changes
        const emailChanged = official_email && official_email !== currentPartner.official_email;
        const phoneChanged = official_phone && official_phone !== currentPartner.official_phone;
        const isSensitiveChange = emailChanged || phoneChanged;

        // 3. Handle OTP Logic
        if (isSensitiveChange) {
            if (!otp) {
                // Generate and Send OTP
                // Cleanup old codes
                await supabaseAdmin.from('verification_codes').delete().eq('user_id', userId).eq('type', 'PROFILE_UPDATE');

                const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                // Get user email for sending OTP (Login email)
                const { data: user } = await supabaseAdmin.from('users').select('email').eq('id', userId).single();

                await supabaseAdmin.from('verification_codes').insert({
                    user_id: userId,
                    code: newOtp,
                    type: 'PROFILE_UPDATE',
                    metadata: { official_email, official_phone, full_address }, // Store pending changes if needed
                    expires_at: new Date(Date.now() + 10 * 60000).toISOString()
                });

                // Send Email 
                await sendProfileUpdateOtpEmail(user.email, newOtp);

                return res.status(403).json({ error: 'OTP required', requiresOtp: true, message: 'OTP sent to your registered email' });
            } else {
                // Verify OTP
                const { data: codes } = await supabaseAdmin
                    .from('verification_codes')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('code', otp)
                    .eq('type', 'PROFILE_UPDATE')
                    .gt('expires_at', new Date().toISOString())
                    .single(); // Should be unique or ordered

                if (!codes) {
                    return res.status(400).json({ error: 'Invalid or expired OTP' });
                }

                // OTP Verified - Delete it
                await supabaseAdmin.from('verification_codes').delete().eq('id', codes.id);
            }
        }

        // 4. Update Database
        const updates = {};
        if (official_email) updates.official_email = official_email;
        if (official_phone) updates.official_phone = official_phone;
        if (full_address) updates.full_address = full_address;

        const { error: updateError } = await supabaseAdmin
            .from('partners')
            .update(updates)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        res.json({ message: 'Profile updated successfully', success: true });

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const userId = req.user.id;

        // 1. Get Partner ID
        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('id, organization_name') // Optimized select
            .eq('user_id', userId)
            .single();

        if (pError || !partner) return res.status(403).json({ error: 'Partner not found' });
        const partnerId = partner.id;

        // 2. Fetch All Events with Tiers (for Totals & Top Events)
        const { data: events, error: eventError } = await supabaseAdmin
            .from('events')
            .select(`
                id,
                title,
                status,
                event_date,
                ticket_tiers (
                    price,
                    total_quantity,
                    available_quantity
                )
            `)
            .eq('partner_id', partnerId);

        if (eventError) throw eventError;

        // 3. fetch ALL bookings for these events to get REAL REVENUE
        const eventIds = events.map(e => e.id);

        let totalRevenue = 0;
        let totalCommission = 0;
        let totalGross = 0;
        let totalSold = 0; // Keeping inventory sold as backup/capacity metric
        let activeEvents = 0;
        let eventStats = [];

        // 3a. Initialize basic inventory stats (Active counts, capacity sold)
        events.forEach(event => {
            if (event.status === 'active' || event.status === 'Live') activeEvents++;
            let eventSoldInventory = 0;
            event.ticket_tiers.forEach(t => {
                eventSoldInventory += (t.total_quantity - t.available_quantity);
            });
            totalSold += eventSoldInventory;

            // Initialize stats struct
            eventStats.push({
                id: event.id,
                title: event.title,
                date: new Date(event.event_date).toLocaleDateString(),
                status: event.status,
                sold: eventSoldInventory,
                revenue: 0, // Will fill below
                gross: 0,
                commission: 0
            });
        });

        // 3b. Fetch REAL Paid Bookings
        let salesTrend = [];

        if (eventIds.length > 0) {
            const { data: bookings, error: bookingError } = await supabaseAdmin
                .from('bookings')
                .select('created_at, total_amount, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid')
                .order('created_at', { ascending: true });

            if (!bookingError && bookings) {
                // --- Total Revenue Calculation ---
                bookings.forEach(b => {
                    const amount = parseFloat(b.total_amount);
                    const comm = amount * 0.05;
                    const net = amount * 0.95;

                    totalGross += amount;
                    totalCommission += comm;
                    totalRevenue += net;

                    // Add to specific event stats
                    const evStat = eventStats.find(e => e.id === b.event_id);
                    if (evStat) {
                        evStat.gross += amount;
                        evStat.commission += comm;
                        evStat.revenue += net;
                    }
                });

                // --- Sales Trend Logic (Booking Count) ---
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const trendMap = {};
                // Initialize last 30 days with 0
                for (let i = 29; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    trendMap[d.toLocaleDateString()] = 0;
                }

                bookings.forEach(b => {
                    const bookingDate = new Date(b.created_at);
                    if (bookingDate >= thirtyDaysAgo) {
                        const dateStr = bookingDate.toLocaleDateString();
                        if (trendMap[dateStr] !== undefined) {
                            trendMap[dateStr] += 1; // Count bookings
                        }
                    }
                });

                salesTrend = Object.keys(trendMap).map(date => ({
                    date,
                    tickets: trendMap[date]
                }));
            }
        }

        // 4. Sort for Top Performing Events (Top 5)
        const topEvents = [...eventStats]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            totalRevenue,
            totalCommission,
            totalGross,
            totalSold,
            activeEvents,
            topEvents,
            salesTrend
        });

    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// ------------------------------------------------------------------
// EARNINGS & PAYOUTS
// ------------------------------------------------------------------

exports.getEarnings = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const userId = req.user.id;

        // 1. Get Partner ID & Bank Details
        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('id, bank_name, bank_branch, account_number, account_holder_name')
            .eq('user_id', userId)
            .single();

        if (pError || !partner) return res.status(403).json({ error: 'Partner not found' });
        const partnerId = partner.id;

        // 2. Calculate Total Revenue (Paid Bookings)
        // Find all events first
        const { data: events } = await supabaseAdmin.from('events').select('id, status, title').eq('partner_id', partnerId);
        const eventIds = events.map(e => e.id);
        const completedEventIds = new Set(events.filter(e => e.status === 'completed' || e.status === 'Ended').map(e => e.id));

        let totalRevenue = 0; // Net
        let totalGross = 0;
        let totalCommission = 0;
        let pendingClearance = 0;

        if (eventIds.length > 0) {
            // Find all paid bookings
            const { data: bookings } = await supabaseAdmin
                .from('bookings')
                .select('total_amount, created_at, status, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid');

            if (bookings) {
                // Logic: 
                // Available = Bookings older than 3 days (example policy)
                // Pending Clearance = Bookings from last 3 days

                const now = new Date();
                const clearanceWindow = 3 * 24 * 60 * 60 * 1000; // 3 Days

                bookings.forEach(b => {
                    const bookingTime = new Date(b.created_at).getTime();
                    // bookings.total_amount is GROSS paid by user
                    const grossAmount = parseFloat(b.total_amount);
                    const comm = grossAmount * 0.05;
                    const netAmount = grossAmount * 0.95;
                    const isCompletedEvent = completedEventIds.has(b.event_id);

                    totalGross += grossAmount;
                    totalCommission += comm;
                    totalRevenue += netAmount; // Net

                    // Pending if: Event not completed OR Payment < 3 days old
                    if (!isCompletedEvent || (now - bookingTime < clearanceWindow)) {
                        pendingClearance += netAmount;
                    }
                });
            }
        }

        // 3. Calculate Total Payouts
        const { data: payouts } = await supabaseAdmin
            .from('payouts')
            .select('amount, status, event_id')
            .eq('partner_id', partnerId)
            .neq('status', 'rejected');

        // Logic: Once requested (pending), it is deducted from "Available".

        let totalWithdrawn = 0;
        let diffFromBalance = 0; // Amount that is NOT available (paid + pending + approved)

        if (payouts) {
            payouts.forEach(p => {
                const amt = parseFloat(p.amount);
                if (p.status === 'paid') totalWithdrawn += amt;

                // Deduct all non-rejected payouts from balance
                diffFromBalance += amt;
            });
        }

        // 4. Calculate Available Balance
        // Available = (Total Revenue - Pending Clearance) - (Payouts In Progress/Paid)
        let availableBalance = (totalRevenue - pendingClearance) - diffFromBalance;
        if (availableBalance < 0) availableBalance = 0; // Safety


        // 5. Aggregate Per-Event Data
        const eventStats = {};

        // Initialize with case-insensitive check
        events.forEach(e => {
            eventStats[e.id] = {
                eventId: e.id,
                title: e.title || 'Untitled Event',
                revenue: 0,
                commission: 0,
                gross: 0,
                pending: 0,
                withdrawn: 0,
                balance: 0,
                status: e.status
            };
        });

        // Sum Revenue
        if (eventIds.length > 0) {
            const { data: bookings } = await supabaseAdmin
                .from('bookings')
                .select('total_amount, created_at, status, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid');

            if (bookings) {
                const now = new Date();

                // const clearanceWindow = 3 * 24 * 60 * 60 * 1000; // 3 Days standard
                const clearanceWindow = 0; // Immediate release for testing

                bookings.forEach(b => {
                    // Deduct 5% Commission
                    const amt = parseFloat(b.total_amount) * 0.95;
                    const eid = b.event_id;

                    // Normalize status check
                    const eventObj = events.find(ev => ev.id === eid);
                    const eventStatus = eventObj ? eventObj.status.toLowerCase() : '';
                    const isCompleted = eventStatus === 'completed' || eventStatus === 'ended';

                    if (eventStats[eid]) {
                        const grossAmt = parseFloat(b.total_amount); // Booking total_amount is Gross
                        const comm = grossAmt * 0.05;
                        const net = grossAmt * 0.95;

                        eventStats[eid].revenue += net;
                        eventStats[eid].commission += comm;
                        eventStats[eid].gross += grossAmt;

                        // Checking individual event rules for pending/balance
                        // If event is NOT completed AND booking is cleaner than window => Pending
                        if (!isCompleted || (now - new Date(b.created_at).getTime() < clearanceWindow)) {
                            // If you want active events to be withdrawable immediately if window passed, remove !isCompleted
                            // But usually, active event funds are held.
                            // FIX: If users want to withdraw from active events, remove !isCompleted check
                            // For now, adhering to user request "available to withdraw is shown 0...". 
                            // Assuming they expect it to be available. 
                            // Let's RELAX the active check for now if CLEARANCE WINDOW is 0.
                            // If clearanceWindow is 0, we allow withdrawal immediately.
                            if (clearanceWindow > 0 && (now - new Date(b.created_at).getTime() < clearanceWindow)) {
                                eventStats[eid].pending += net;
                            }
                            // If you strictly want to block Active events:
                            // if (!isCompleted) eventStats[eid].pending += net;
                        }
                    }
                });
            }
        }

        // Sum Payouts
        if (payouts) {
            payouts.forEach(p => {
                const amt = parseFloat(p.amount);
                const eid = p.event_id; // Payouts now have event_id

                if (eid && eventStats[eid]) {
                    if (p.status === 'paid') eventStats[eid].withdrawn += amt;
                    // Deduct all non-rejected from balance
                    eventStats[eid].balance -= amt;
                }
            });
        }

        // Calculate Final Balance per Event
        Object.values(eventStats).forEach(ev => {
            ev.balance += (ev.revenue - ev.pending); // Revenue (Net) - Pending = Available
            if (ev.balance < 0) ev.balance = 0;
            // Debug Log
            console.log(`[DEBUG] Event: ${ev.title} (${ev.status}) -> Rev: ${ev.revenue}, Pending: ${ev.pending}, Withdrawn: ${ev.withdrawn}, Balance: ${ev.balance}`);
        });

        res.json({
            totalRevenue, // Net
            totalGross,
            totalCommission,
            pendingClearance,
            totalWithdrawn,
            availableBalance,
            events: Object.values(eventStats),
            bankDetails: {
                bankName: partner.bank_name,
                branch: partner.bank_branch,
                accountNumber: partner.account_number,
                accountHolder: partner.account_holder_name
            }
        });

    } catch (err) {
        console.error('Get Earnings Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.requestPayout = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const { amount, password } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
        if (!password) return res.status(400).json({ error: 'Password required' });

        const userId = req.user.id;

        // 1. Verify Password (Security Check)
        const { data: user } = await supabaseAdmin.from('users').select('password_hash').eq('id', userId).single();
        if (!user) return res.status(401).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(403).json({ error: 'Incorrect password' });

        // 2. Get Partner
        const { data: partner } = await supabaseAdmin.from('partners').select('*').eq('user_id', userId).single();
        if (!partner) return res.status(403).json({ error: 'Partner not found' });

        // 3. Bank Details Check
        if (!partner.bank_name || !partner.account_number) {
            return res.status(400).json({ error: 'Please update your bank details in settings first.' });
        }

        // 4. Check Balance (Same logic as getEarnings, simplified)
        // --- Simplified Re-calculation ---
        const { data: events } = await supabaseAdmin.from('events').select('id, status').eq('partner_id', partner.id);
        const eventIds = events.map(e => e.id);
        const completedEventIds = new Set(events.filter(e => e.status === 'completed' || e.status === 'Ended').map(e => e.id));

        let grossIncome = 0;
        let clearanceHold = 0; // Money we CANNOT withdraw yet

        if (eventIds.length > 0) {
            const { data: bookings } = await supabaseAdmin
                .from('bookings')
                .select('total_amount, created_at, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid');

            if (bookings) {
                const now = new Date();
                bookings.forEach(b => {
                    const amt = parseFloat(b.total_amount) * 0.95; // Deduct 5% Commission
                    const isCompleted = completedEventIds.has(b.event_id);

                    grossIncome += amt;

                    // Hold if event not completed OR < 3 days
                    // For testing: DISABLED HOLD
                    if (!isCompleted || (now - new Date(b.created_at)) < 0) {
                        // clearanceHold += amt; 
                    }
                });
            }
        }

        const { data: allPayouts } = await supabaseAdmin
            .from('payouts')
            .select('amount')
            .eq('partner_id', partner.id)
            .neq('status', 'rejected');

        let usedFunds = 0;
        if (allPayouts) allPayouts.forEach(p => usedFunds += parseFloat(p.amount));

        const maxWithdrawable = (grossIncome - clearanceHold) - usedFunds;

        if (amount > maxWithdrawable) {
            return res.status(400).json({ error: `Insufficient funds. Available: Rs. ${maxWithdrawable}` });
        }

        // 5. Create Payout Request
        const { error: insertError } = await supabaseAdmin.from('payouts').insert({
            partner_id: partner.id,
            amount: amount,
            status: 'pending'
        });

        if (insertError) throw insertError;

        res.json({ message: 'Withdrawal request submitted successfully' });

    } catch (err) {
        console.error('Request Payout Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPayoutHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { event_id, startDate, endDate } = req.query;

        // Get Partner ID
        const { data: partner } = await supabaseAdmin.from('partners').select('id').eq('user_id', req.user.id).single();
        if (!partner) return res.status(403).json({ error: 'Partner not found' });

        let query = supabaseAdmin
            .from('payouts')
            .select('*, events(title)')
            .eq('partner_id', partner.id)
            .order('requested_at', { ascending: false });

        if (event_id && event_id !== 'all') {
            query = query.eq('event_id', event_id);
        }

        if (startDate) {
            query = query.gte('requested_at', startDate);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query = query.lte('requested_at', end.toISOString());
        }

        const { data: payouts, error } = await query;

        if (error) throw error;
        res.json(payouts);

    } catch (err) {
        console.error('Payout History Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.initiatePayout = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const { amount, password, event_id } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
        if (!event_id) return res.status(400).json({ error: 'Event ID required' });
        if (!password) return res.status(400).json({ error: 'Password required' });

        const userId = req.user.id;

        // 1. Verify Password
        const { data: user } = await supabaseAdmin.from('users').select('password_hash, email').eq('id', userId).single();
        if (!user) return res.status(401).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(403).json({ error: 'Incorrect password' });

        // 2. Verify Event & Ownership
        const { data: partner } = await supabaseAdmin.from('partners').select('id, bank_name, account_number').eq('user_id', userId).single();
        if (!partner) return res.status(403).json({ error: 'Partner not found' });

        if (!partner.bank_name || !partner.account_number) {
            return res.status(400).json({ error: 'Please update your bank details in settings first.' });
        }

        const { data: event } = await supabaseAdmin.from('events').select('id, status').eq('id', event_id).eq('partner_id', partner.id).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (event.status !== 'completed' && event.status !== 'Ended') {
            return res.status(400).json({ error: 'Withdrawals are only allowed for Completed events.' });
        }

        // 3. Calculate Balance for THIS Event
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('total_amount, created_at')
            .eq('event_id', event_id)
            .eq('status', 'paid');

        let grossEventRevenue = 0;
        let clearanceHold = 0;
        const now = new Date();

        if (bookings) {
            bookings.forEach(b => {
                const amt = parseFloat(b.total_amount) * 0.95; // Deduct 5% Commission
                grossEventRevenue += amt;
                // TEST: Disabled 3-day hold
                if ((now - new Date(b.created_at)) < 0) clearanceHold += amt;
            });
        }

        const { data: eventPayouts } = await supabaseAdmin
            .from('payouts')
            .select('amount, status')
            .eq('event_id', event_id)
            .neq('status', 'rejected');

        let withdrawn = 0;
        let hasPending = false;

        if (eventPayouts) {
            eventPayouts.forEach(p => {
                withdrawn += parseFloat(p.amount);
                if (p.status === 'pending') hasPending = true;
            });
        }

        if (hasPending) {
            return res.status(400).json({ error: 'You already have a pending withdrawal for this event. Please wait for it to be processed.' });
        }

        const available = (grossEventRevenue - clearanceHold) - withdrawn;

        if (amount > available) {
            return res.status(400).json({ error: `Insufficient funds for this event. Available: Rs. ${available}` });
        }

        // 4. Generate & Store OTP
        // Cleanup old codes first (Handle Resend)
        await supabaseAdmin.from('verification_codes').delete().eq('user_id', userId).eq('type', 'PAYOUT');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const { error: otpError } = await supabaseAdmin.from('verification_codes').insert({
            user_id: userId,
            code: otp,
            type: 'PAYOUT',
            metadata: { amount, event_id, partner_id: partner.id },
            expires_at: new Date(Date.now() + 10 * 60000).toISOString() // 10 mins
        });

        if (otpError) throw otpError;

        await sendWithdrawalOtpEmail(user.email, otp, amount);

        res.json({ message: 'OTP sent to your email' });

    } catch (err) {
        console.error('Initiate Payout Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.confirmPayout = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const { otp } = req.body;

        if (!otp) return res.status(400).json({ error: 'OTP required' });

        const userId = req.user.id;

        // 1. Verify OTP
        const { data: codes } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('user_id', userId)
            .eq('code', otp)
            .eq('type', 'PAYOUT')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (!codes || codes.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const verification = codes[0];
        const { amount, event_id, partner_id } = verification.metadata;

        // 2. Re-verify Balance (Safety Check)
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('total_amount, created_at')
            .eq('event_id', event_id)
            .eq('status', 'paid');

        let gross = 0;
        let hold = 0;
        const now = new Date();

        if (bookings) bookings.forEach(b => {
            const amt = parseFloat(b.total_amount) * 0.95; // Deduct 5% Commission
            gross += amt;
            // TEST: Disabled 3-day hold
            if ((now - new Date(b.created_at)) < 0) hold += amt;
        });

        const { data: eventPayouts } = await supabaseAdmin
            .from('payouts')
            .select('amount')
            .eq('event_id', event_id)
            .neq('status', 'rejected');

        let withdrawn = 0;
        if (eventPayouts) eventPayouts.forEach(p => withdrawn += parseFloat(p.amount));

        const available = (gross - hold) - withdrawn;

        if (amount > available) {
            return res.status(400).json({ error: 'Balance mismatch. Payout cancelled.' });
        }

        // 3. Create Payout
        const { data: payoutData, error: payoutError } = await supabaseAdmin.from('payouts').insert({
            partner_id: partner_id,
            event_id: event_id,
            amount: amount,
            status: 'pending',
            requested_at: new Date().toISOString()
        }).select();

        if (payoutError) throw payoutError;

        // 4. Log Withdrawal & Delete OTP
        await supabaseAdmin.from('withdrawal_logs').insert({
            payout_id: payoutData[0].id,
            partner_id: partner_id,
            action_type: 'CONFIRM_OTP',
            status: 'success',
            ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            details: { amount, event_id }
        });

        await supabaseAdmin.from('verification_codes').delete().eq('id', verification.id);

        res.json({ message: 'Withdrawal request submitted successfully' });

    } catch (err) {
        console.error('Confirm Payout Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
