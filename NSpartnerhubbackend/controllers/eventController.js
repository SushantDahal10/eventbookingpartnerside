const { supabaseAdmin } = require('../db');

// Helper to sanitize filenames/foldernames
const sanitize = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
};

const uploadEventImage = async (file, folderPath, fileName, bucket = 'Thumbnail_other') => {
    if (!file) return null;

    const fileExt = file.originalname.split('.').pop();
    const fullPath = `${folderPath}/${fileName}.${fileExt}`;

    const { data, error } = await supabaseAdmin
        .storage
        .from(bucket)
        .upload(fullPath, file.buffer, {
            contentType: file.mimetype,
            upsert: false // Don't overwrite, fail if exists (though unique naming should prevent this)
        });

    if (error) {
        console.error('Event Image Upload Error:', error);
        throw new Error('Failed to upload image');
    }

    const { data: publicURLData } = supabaseAdmin
        .storage
        .from(bucket)
        .getPublicUrl(fullPath);

    return publicURLData.publicUrl;
};

exports.createEvent = async (req, res) => {
    // Note: partner_id is derived from `req.user.id` for security
    const { title, description, category, date, location, fullAddress, city, state, tiers } = req.body;

    // Parse tiers if stringified
    let parsedTiers = [];
    try {
        parsedTiers = typeof tiers === 'string' ? JSON.parse(tiers) : tiers;
    } catch (e) {
        return res.status(400).json({ error: 'Invalid tiers format' });
    }

    if (!title || !date || !parsedTiers || parsedTiers.length === 0) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        // 1. Get Partner Info from Auth User (req.user.id is from middleware)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }

        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('id, organization_name')
            .eq('user_id', req.user.id)
            .single();

        if (pError || !partner) return res.status(404).json({ error: 'Partner account not found.' });

        const partner_id = partner.id;

        // 2. Prepare Folder Name: {Organization}_{Event}_{Date}
        const cleanOrg = sanitize(partner.organization_name);
        const cleanTitle = sanitize(title);

        // Handle if date is array (shouldn't be with frontend fix, but for safety)
        const dateStr = Array.isArray(date) ? date[date.length - 1] : date;
        const cleanDate = sanitize(dateStr.split('T')[0]); // Use YYYY-MM-DD part

        const folderName = `${cleanOrg}_${cleanTitle}_${cleanDate}`;

        // 3. Upload Images
        let coverUrl = null;
        let galleryUrls = [];

        if (req.files) {
            // Cover Image -> _thumbnail
            if (req.files.coverImage && req.files.coverImage[0]) {
                const coverName = `${folderName}_thumbnail`;
                coverUrl = await uploadEventImage(req.files.coverImage[0], folderName, coverName);
            }

            // Gallery Images -> _gallery1, _gallery2...
            if (req.files.galleryImages) {
                for (let i = 0; i < req.files.galleryImages.length; i++) {
                    const galleryName = `${folderName}_gallery${i + 1}`;
                    const url = await uploadEventImage(req.files.galleryImages[i], folderName, galleryName);
                    galleryUrls.push({ url, type: 'gallery' });
                }
            }
        }

        if (!coverUrl) {
            return res.status(400).json({ error: 'Cover image is required.' });
        }

        // 4. Create Event
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .insert({
                partner_id,
                title,
                description,
                category: category || 'Uncategorized', // Default
                event_date: date,
                event_date: date,
                location,
                full_address: fullAddress,
                city,
                state,
                // created_at is default
            })
            .select()
            .single();

        if (eventError) throw eventError;

        // 5. Create Ticket Tiers
        const tiersToInsert = parsedTiers.map(t => ({
            event_id: event.id,
            tier_name: t.name,
            price: parseFloat(t.price),
            total_quantity: parseInt(t.quantity),
            available_quantity: parseInt(t.quantity),
            perks: t.perks || []
        }));

        const { error: tierError } = await supabaseAdmin
            .from('ticket_tiers')
            .insert(tiersToInsert);

        if (tierError) {
            // Rollback Event
            await supabaseAdmin.from('events').delete().eq('id', event.id);
            throw tierError;
        }

        // 6. Save Images to DB
        const imagesToInsert = [
            { event_id: event.id, image_url: coverUrl, image_type: 'cover' },
            ...galleryUrls.map(g => ({ event_id: event.id, image_url: g.url, image_type: 'gallery' }))
        ];

        const { error: imgError } = await supabaseAdmin
            .from('event_images')
            .insert(imagesToInsert);

        if (imgError) {
            console.error('Image DB Insert Error (Images uploaded but DB failed):', imgError);
            // Non-critical (?) but inconsistent. 
            // Better to warn user.
        }

        res.status(201).json({ message: 'Event created successfully', eventId: event.id });

    } catch (err) {
        console.error('Create Event Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
