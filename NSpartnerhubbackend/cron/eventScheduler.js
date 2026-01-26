const cron = require('node-cron');
const { supabaseAdmin } = require('../db');

// Run every hour
const startEventScheduler = () => {
    console.log('📅 Event Scheduler Initialized');

    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running Event Status Check...');
        try {
            const now = new Date().toISOString();

            // Find active/upcoming events that have passed
            // Note: 'status' IN ('active', 'Live', 'Upcoming') AND event_date < NOW()
            // We use a raw query or simple selector. logic: event_date < now

            const { data: expiredEvents, error } = await supabaseAdmin
                .from('events')
                .select('id, title')
                .lt('event_date', now)
                .neq('status', 'completed')
                .neq('status', 'cancelled')
                .neq('status', 'Ended'); // Check all variations

            if (error) throw error;

            if (expiredEvents && expiredEvents.length > 0) {
                console.log(`Found ${expiredEvents.length} expired events. Updating...`);

                const ids = expiredEvents.map(e => e.id);

                const { error: updateError } = await supabaseAdmin
                    .from('events')
                    .update({ status: 'completed' }) // correct status per schema
                    .in('id', ids);

                if (updateError) throw updateError;

                console.log(`✅ Successfully updated ${expiredEvents.length} events to 'Ended'.`);
            } else {
                console.log('No expired events found.');
            }

        } catch (err) {
            console.error('❌ Event Scheduler Error:', err);
        }
    });
};

module.exports = startEventScheduler;
