const { supabaseAdmin } = require('../db');

// Request Gate Staff
exports.requestGateStaff = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        const userId = req.user.id; // From requireAuth middleware

        if (!eventId || quantity === undefined) {
            return res.status(400).json({ error: 'Event ID and Quantity are required.' });
        }

        // 1. Get Partner ID from User ID
        const { data: partner, error: partnerError } = await supabaseAdmin
            .from('partners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (partnerError || !partner) {
            return res.status(403).json({ error: 'Partner account not found.' });
        }

        const partnerId = partner.id;

        // 2. Fetch Event to Validate
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('id, event_date, status, partner_id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        // 3. Validation Rules

        // Ownership Check
        if (event.partner_id !== partnerId) {
            return res.status(403).json({ error: 'You do not have permission for this event.' });
        }

        // Completed/Cancelled Check
        if (event.status === 'completed' || event.status === 'cancelled') {
            return res.status(400).json({ error: 'Cannot request staff for completed or cancelled events.' });
        }

        // 12-Hour Cutoff Check
        const eventTime = new Date(event.event_date).getTime();
        const currentTime = Date.now();
        const twelveHoursMs = 12 * 60 * 60 * 1000;

        if (eventTime - currentTime < twelveHoursMs) {
            return res.status(400).json({ error: 'Requests are closed. Must request at least 12 hours before the event.' });
        }

        // 4. Update Event with Request
        // If updating an existing request, we allow it (as per user: "give option for request too again")
        // We set status to 'pending' if it changed (or always reset to pending for new review?)
        // Let's set to 'pending' to trigger admin review again.

        // 4. Upsert into gate_staff_requests
        const { error: upsertError } = await supabaseAdmin
            .from('gate_staff_requests')
            .upsert({
                event_id: eventId,
                partner_id: partnerId,
                requested_count: quantity,
                status: 'pending'
            }, { onConflict: 'event_id' });

        if (upsertError) {
            console.error('Upsert Request Error:', upsertError);
            return res.status(500).json({ error: 'Failed to submit request.' });
        }

        res.json({ message: 'Gate staff request submitted successfully.' });

    } catch (err) {
        console.error('Request Gate Staff Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Gate Staff Request Status (Optional, useful for UI)
exports.getGateStaffRequest = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        // Verify Partner... logic similar to above or just let RLS handle it?
        // Admin client bypasses RLS, so we MUST verify ownership manually.

        const { data: partner } = await supabaseAdmin
            .from('partners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!partner) return res.status(403).json({ error: 'Unauthorized' });

        const { data: request, error: reqError } = await supabaseAdmin
            .from('gate_staff_requests')
            .select('requested_count, approved_count, status, partner_id')
            .eq('event_id', eventId)
            .single();

        if (reqError && reqError.code !== 'PGRST116') { // PGRST116 is 'not found' which is fine
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!request) {
            return res.json({ requested_count: 0, status: 'none' });
        }

        if (request.partner_id !== partner.id) return res.status(403).json({ error: 'Unauthorized' });

        res.json({
            requested_count: request.requested_count,
            approved_count: request.approved_count || 0,
            status: request.status
        });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
