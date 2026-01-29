const { supabaseAdmin } = require('./db');

async function debug() {
    console.log("Fetching partners directly...");
    const { data: partners, error } = await supabaseAdmin.from('partners').select('id, organization_name, user_id');

    if (error) {
        console.error("Error fetching partners:", error);
        return;
    }

    console.log("Partners:", partners);

    if (partners && partners.length > 0) {
        // Pick the first partner
        const partner = partners[0];
        console.log(`\nDebug for Partner: ${partner.organization_name} (User: ${partner.user_id})`);
        await getEarnings(partner.user_id);
    } else {
        console.log("No partners found.");
    }
}

// COPIED AND ADAPTED LOGIC
async function getEarnings(userId) {
    try {
        // 1. Get Partner ID & Bank Details
        const { data: partner, error: pError } = await supabaseAdmin
            .from('partners')
            .select('id, bank_name, bank_branch, account_number, account_holder_name')
            .eq('user_id', userId)
            .single();

        if (pError || !partner) { console.log('Partner not found'); return; }
        const partnerId = partner.id;
        console.log("Partner ID:", partnerId);

        // 2. Calculate Total Revenue (Paid Bookings)
        const { data: events } = await supabaseAdmin.from('events').select('id, status, title').eq('partner_id', partnerId);
        const eventIds = events.map(e => e.id);
        const completedEventIds = new Set(events.filter(e => e.status === 'completed' || e.status === 'Ended').map(e => e.id));

        console.log("Events:", events);

        let totalRevenue = 0; // Net
        let totalGross = 0;
        let totalCommission = 0;
        let pendingClearance = 0;

        if (eventIds.length > 0) {
            const { data: bookings } = await supabaseAdmin
                .from('bookings')
                .select('total_amount, created_at, status, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid');

            console.log(`Found ${bookings ? bookings.length : 0} paid bookings.`);

            if (bookings) {
                const now = new Date();
                const clearanceWindow = 3 * 24 * 60 * 60 * 1000;

                bookings.forEach(b => {
                    const bookingTime = new Date(b.created_at).getTime();
                    const grossAmount = parseFloat(b.total_amount);
                    const comm = grossAmount * 0.05;
                    const netAmount = grossAmount * 0.95;
                    const isCompletedEvent = completedEventIds.has(b.event_id);

                    totalGross += grossAmount;
                    totalCommission += comm;
                    totalRevenue += netAmount;

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

        console.log("Payouts:", payouts);

        let totalWithdrawn = 0;
        let diffFromBalance = 0;

        if (payouts) {
            payouts.forEach(p => {
                const amt = parseFloat(p.amount);
                if (p.status === 'paid') totalWithdrawn += amt;
                diffFromBalance += amt;
            });
        }

        let availableBalance = (totalRevenue - pendingClearance) - diffFromBalance;
        if (availableBalance < 0) availableBalance = 0;

        console.log("\n--- GLOBAL STATS ---");
        console.log("Total Revenue (Net):", totalRevenue);
        console.log("Pending Clearance:", pendingClearance);
        console.log("Total Withdrawn:", totalWithdrawn);
        console.log("Diff From Balance (All Payouts):", diffFromBalance);
        console.log("Available Balance:", availableBalance);

        // 5. Aggregate Per-Event Data
        const eventStats = {};

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

        if (eventIds.length > 0) {
            const { data: bookings } = await supabaseAdmin
                .from('bookings')
                .select('total_amount, created_at, status, event_id')
                .in('event_id', eventIds)
                .eq('status', 'paid');

            if (bookings) {
                const now = new Date();
                const clearanceWindow = 0;

                bookings.forEach(b => {
                    const amt = parseFloat(b.total_amount) * 0.95;
                    const eid = b.event_id;
                    const isCompleted = completedEventIds.has(eid);

                    if (eventStats[eid]) {
                        const grossAmt = parseFloat(b.total_amount);
                        const comm = grossAmt * 0.05;
                        const net = grossAmt * 0.95;

                        eventStats[eid].revenue += net;
                        eventStats[eid].commission += comm;
                        eventStats[eid].gross += grossAmt;

                        if (!isCompleted || (now - new Date(b.created_at).getTime() < clearanceWindow)) {
                            eventStats[eid].pending += net;
                        }
                    }
                });
            }
        }

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
        });

        console.log("\n--- PER EVENT STATS ---");
        console.log(JSON.stringify(Object.values(eventStats), null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

debug();
