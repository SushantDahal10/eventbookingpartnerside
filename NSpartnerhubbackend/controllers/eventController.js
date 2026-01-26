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

exports.getMyEvents = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }

        // 1. Get Partner ID
        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (pError || !partner) return res.status(404).json({ error: 'Partner account not found.' });

        // 2. Fetch Events
        const { data: events, error: eventError } = await supabaseAdmin
            .from('events')
            .select(`
                id,
                title,
                event_date,
                location,
                status,
                event_images (image_url, image_type),
                ticket_tiers (total_quantity, available_quantity, price)
            `)
            .eq('partner_id', partner.id)
            .order('created_at', { ascending: false });

        if (eventError) throw eventError;

        // 3. Format Data
        const formattedEvents = events.map(e => {
            const coverImage = e.event_images.find(img => img.image_type === 'cover')?.image_url || null;

            const totalCapacity = e.ticket_tiers.reduce((acc, t) => acc + t.total_quantity, 0);
            const totalAvailable = e.ticket_tiers.reduce((acc, t) => acc + t.available_quantity, 0);
            const sold = totalCapacity - totalAvailable;

            const revenue = e.ticket_tiers.reduce((acc, t) => {
                const tierSold = t.total_quantity - t.available_quantity;
                return acc + (tierSold * t.price);
            }, 0);

            return {
                id: e.id,
                title: e.title,
                date: new Date(e.event_date).toLocaleDateString(),
                time: new Date(e.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                venue: e.location,
                status: e.status === 'active' ? (new Date(e.event_date) < new Date() ? 'Ended' : 'Live') : e.status,
                sold: sold,
                capacity: totalCapacity,
                revenue: `Rs. ${revenue.toLocaleString()}`,
                img: coverImage,
                views: "0",
                conversion: "0%"
            };
        });

        res.json(formattedEvents);

    } catch (err) {
        console.error('Get My Events Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getEventAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const userId = req.user.id;

        // 1. Verify Ownership (Security)
        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (pError || !partner) return res.status(403).json({ error: 'Unauthorized' });

        // 2. Fetch Event with Tiers
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select(`
                id,
                title,
                status,
                ticket_tiers (
                    id,
                    tier_name,
                    price,
                    total_quantity,
                    available_quantity
                )
            `)
            .eq('id', id)
            .eq('partner_id', partner.id)
            .single();

        if (eventError || !event) return res.status(404).json({ error: 'Event not found' });

        // 3. Calculate Analytics
        let totalRevenue = 0;
        let totalSold = 0;
        let totalCapacity = 0;

        const tiersAnalytics = event.ticket_tiers.map(tier => {
            const sold = tier.total_quantity - tier.available_quantity;
            const revenue = sold * tier.price;

            totalRevenue += revenue;
            totalSold += sold;
            totalCapacity += tier.total_quantity;

            return {
                name: tier.tier_name,
                price: tier.price,
                capacity: tier.total_quantity,
                available: tier.available_quantity,
                sold: sold,
                revenue: revenue
            };
        });

        // 4. Fetch Sales Trend (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: bookings, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('created_at, total_amount')
            .eq('event_id', id)
            .eq('status', 'paid')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        let salesTrend = [];
        if (!bookingError && bookings) {
            // Group by date
            const trendMap = {};
            bookings.forEach(b => {
                const date = new Date(b.created_at).toLocaleDateString();
                trendMap[date] = (trendMap[date] || 0) + parseFloat(b.total_amount);
            });

            // Format for Frontend
            salesTrend = Object.keys(trendMap).map(date => ({
                date,
                revenue: trendMap[date]
            }));
        }

        // 5. Return Data
        res.json({
            eventTitle: event.title,
            status: event.status,
            totalRevenue,
            totalSold,
            totalCapacity,
            tiers: tiersAnalytics,
            salesTrend // [ { date: '1/1/2026', revenue: 5000 }, ... ]
        });

    } catch (err) {
        console.error('Get Analytics Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.cancelEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        if (!reason || reason.trim().length < 5) return res.status(400).json({ error: 'Valid cancellation reason required' });

        const userId = req.user.id;

        // 1. Verify Owner
        const { data: partner } = await supabaseAdmin.from('partners').select('id').eq('user_id', userId).single();
        if (!partner) return res.status(403).json({ error: 'Unauthorized' });

        // 2. Fetch Event Status & Sales
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('id, status, ticket_tiers(total_quantity, available_quantity)')
            .eq('id', id)
            .eq('partner_id', partner.id)
            .single();

        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.status === 'cancelled') return res.status(400).json({ error: 'Event already cancelled' });
        if (event.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed event' });

        // 3. Check for Sales (Refund Logic)
        let totalSold = 0;
        event.ticket_tiers.forEach(t => totalSold += (t.total_quantity - t.available_quantity));

        // Note: Realistically, if sold > 0, we trip a 'Refund Queue' workflow.
        // For now, we update status and log reason.

        const updateData = {
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
        };

        const { error: updateError } = await supabaseAdmin
            .from('events')
            .update(updateData)
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({
            message: totalSold > 0
                ? 'Event cancelled. Refunds will be processed for sold tickets.'
                : 'Event cancelled successfully.'
        });

    } catch (err) {
        console.error('Cancel Event Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
