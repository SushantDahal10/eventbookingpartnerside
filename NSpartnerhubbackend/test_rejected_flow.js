const { supabaseAdmin } = require('./db');

async function testRejectedFlow() {
    console.log("Starting Rejected Payout Flow Test...");

    // 1. Pick a VALID partner and event
    const { data: partners } = await supabaseAdmin.from('partners').select('id, user_id');

    let partner, event;

    for (const p of partners) {
        const { data: events } = await supabaseAdmin.from('events').select('id, title').eq('partner_id', p.id).limit(1);
        if (events && events.length > 0) {
            partner = p;
            event = events[0];
            break;
        }
    }

    if (!partner || !event) { console.log("No valid partner/event found for testing"); return; }

    console.log(`Testing with Partner: ${partner.id}, Event: ${event.title} (${event.id})`);

    // 2. Initial Balance Check
    console.log("\n--- Initial State ---");
    await checkBalance(partner.user_id, event.id);

    // 3. Create Pending Payout
    const amount = 500;
    console.log(`\n--- Creating Pending Payout of ${amount} ---`);
    const { data: payout, error } = await supabaseAdmin.from('payouts').insert({
        partner_id: partner.id,
        event_id: event.id,
        amount: amount,
        status: 'pending',
        requested_at: new Date().toISOString()
    }).select().single();

    if (error) { console.error("Insert Error:", error); return; }
    const payoutId = payout.id;

    await checkBalance(partner.user_id, event.id);

    // 4. Reject Payout
    console.log(`\n--- Rejecting Payout ---`);
    await supabaseAdmin.from('payouts').update({ status: 'rejected' }).eq('id', payoutId);
    await checkBalance(partner.user_id, event.id);

    // 5. Cleanup (Delete test payout)
    console.log(`\n--- Cleanup ---`);
    await supabaseAdmin.from('payouts').delete().eq('id', payoutId);
    await checkBalance(partner.user_id, event.id);
}

// Re-using logic from debugging
async function checkBalance(userId, eventId) {
    // Call the actual Controller logic or simulate it identically?
    // Better to simulate cleanly to verify the LOGIC itself

    const { data: payouts } = await supabaseAdmin
        .from('payouts')
        .select('amount, status, event_id')
        .eq('event_id', eventId) // Narrow down for clean log
        .neq('status', 'rejected');

    let lockedFunds = 0;
    payouts.forEach(p => lockedFunds += parseFloat(p.amount));

    console.log(`Active Payouts Count (Pending/Paid): ${payouts.length}`);
    console.log(`Locked Funds (Deducted from Balance): ${lockedFunds}`);
}

testRejectedFlow();
