const { supabaseAdmin } = require('./db');

async function debug() {
    console.log("Fetching partners directly...");
    const { data: partners, error } = await supabaseAdmin.from('partners').select('id, organization_name, user_id');

    if (error) { console.error(error); return; }

    if (partners && partners.length > 0) {
        const partner = partners[0];
        console.log(`\nDebug for Partner: ${partner.organization_name} (User: ${partner.user_id})`);
        await getEarnings(partner.user_id);
    }
}

// Updated Logic to Match Controller
async function getEarnings(userId) {
    try {
        const { data: partner } = await supabaseAdmin.from('partners').select('id').eq('user_id', userId).single();
        const partnerId = partner.id;

        const { data: events } = await supabaseAdmin.from('events').select('id, status, title').eq('partner_id', partnerId);
        const eventIds = events.map(e => e.id);

        let totalRevenue = 0;
        let pendingClearance = 0;

        // 5. Aggregate Per-Event Data
        const eventStats = {};

        // Initialize with case-insensitive check
        events.forEach(e => {
            eventStats[e.id] = {
                eventId: e.id,
                title: e.title || 'Untitled Event',
                revenue: 0,
                pending: 0,
                withdrawn: 0,
                balance: 0,
                status: e.status
            };
        });

        if (eventIds.length > 0) {
            const { data: bookings } = await supabaseAdmin
                .from('bookings')
                .select('total_amount, created_at, status, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid');

            if (bookings) {
                const now = new Date();
                const clearanceWindow = 0; // Immediate release as per fix

                bookings.forEach(b => {
                    const amt = parseFloat(b.total_amount) * 0.95;
                    const eid = b.event_id;

                    // Normalize status check
                    const eventObj = events.find(ev => ev.id === eid);
                    const eventStatus = eventObj ? eventObj.status.toLowerCase() : '';
                    const isCompleted = eventStatus === 'completed' || eventStatus === 'ended';

                    if (eventStats[eid]) {
                        const net = amt; // Already deducted
                        eventStats[eid].revenue += net;
                        totalRevenue += net;

                        // FIX LOGIC TEST
                        if (clearanceWindow > 0 && (now - new Date(b.created_at).getTime() < clearanceWindow)) {
                            eventStats[eid].pending += net;
                            pendingClearance += net;
                        }
                    }
                });
            }
        }

        const { data: payouts } = await supabaseAdmin.from('payouts').select('amount, status, event_id').eq('partner_id', partnerId).neq('status', 'rejected');

        if (payouts) {
            payouts.forEach(p => {
                const amt = parseFloat(p.amount);
                const eid = p.event_id;
                if (eid && eventStats[eid]) {
                    if (p.status === 'paid') eventStats[eid].withdrawn += amt;
                    eventStats[eid].balance -= amt;
                }
            });
        }

        Object.values(eventStats).forEach(ev => {
            ev.balance += (ev.revenue - ev.pending);
            if (ev.balance < 0) ev.balance = 0;
            console.log(`[VERIFY] Event: ${ev.title} (${ev.status}) -> Rev: ${ev.revenue}, Pending: ${ev.pending}, Withdrawn: ${ev.withdrawn}, Balance: ${ev.balance}`);
        });

    } catch (err) {
        console.error('Error:', err);
    }
}

debug();
