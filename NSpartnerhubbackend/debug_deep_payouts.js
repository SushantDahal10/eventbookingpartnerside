const { supabaseAdmin } = require('./db');
const fs = require('fs');

async function debug() {
    console.log("Fetching partners...");
    const { data: partners } = await supabaseAdmin.from('partners').select('id, organization_name, user_id');

    if (!partners || partners.length === 0) { console.log("No partners"); return; }

    // Clear file
    fs.writeFileSync('debug_calc_result.txt', '');

    for (const partner of partners) {
        console.log(`Checking Partner: ${partner.organization_name}`);
        await checkPartner(partner.id);
    }
}

async function checkPartner(partnerId) {
    // 1. Fetch Events
    const { data: events } = await supabaseAdmin.from('events').select('id, title, status').eq('partner_id', partnerId);

    const eventIds = events.map(e => e.id);
    if (eventIds.length === 0) return;

    // 2. Fetch Bookings
    const { data: bookings } = await supabaseAdmin
        .from('bookings')
        .select('total_amount, created_at, status, event_id')
        .in('event_id', eventIds)
        .eq('status', 'paid');

    const eventRevenue = {}; // Map event_id -> revenue
    const eventPending = {}; // Map event_id -> pending

    const now = new Date();
    const clearanceWindow = 0; // Simulate the 0 window

    bookings.forEach(b => {
        const amt = parseFloat(b.total_amount) * 0.95;
        const eid = b.event_id;

        if (!eventRevenue[eid]) eventRevenue[eid] = 0;
        eventRevenue[eid] += amt;

        // Pending Check Logic
        const ev = events.find(e => e.id === eid);
        const eventStatus = ev ? ev.status.toLowerCase() : '';
        const isCompleted = eventStatus === 'completed' || eventStatus === 'ended';

        if (!eventPending[eid]) eventPending[eid] = 0;

        // Logic from Controller
        if (!isCompleted || (now - new Date(b.created_at).getTime() < clearanceWindow)) {
            if (clearanceWindow > 0 && (now - new Date(b.created_at).getTime() < clearanceWindow)) {
                eventPending[eid] += amt;
            }
        }
    });

    // 3. Fetch Payouts
    const { data: payouts } = await supabaseAdmin
        .from('payouts')
        .select('amount, status, event_id')
        .eq('partner_id', partnerId)
        .neq('status', 'rejected');

    const eventWithdrawn = {}; // event_id -> amount

    payouts.forEach(p => {
        const eid = p.event_id;
        if (eid) {
            if (!eventWithdrawn[eid]) eventWithdrawn[eid] = 0;
            eventWithdrawn[eid] += parseFloat(p.amount);
        }
    });

    // 4. Calculate Final Stats
    let output = `\n[CALCULATION] Partner: ${partnerId}\n`;

    events.forEach(e => {
        const rev = eventRevenue[e.id] || 0;
        const pen = eventPending[e.id] || 0;
        const wdr = eventWithdrawn[e.id] || 0;

        let balance = 0;
        balance -= wdr;
        balance += (rev - pen);

        if (balance < 0) balance = 0;

        output += ` EVENT: ${e.title} (Status: ${e.status}, ID: ${e.id})\n`;
        output += `   Revenue: ${rev}\n`;
        output += `   Pending: ${pen}\n`;
        output += `   Withdrawn: ${wdr}\n`;
        output += `   CALC BALANCE: ${balance}\n`;
        output += `-----------------------\n`;
    });

    fs.appendFileSync('debug_calc_result.txt', output);
}

debug();
