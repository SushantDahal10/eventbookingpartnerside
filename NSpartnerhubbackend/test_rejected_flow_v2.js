const { supabaseAdmin } = require('./db');
const fs = require('fs');

async function testRejectedFlow() {
    let output = "Starting Rejected Payout Flow Test...\n";

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

    if (!partner || !event) {
        fs.writeFileSync('test_result_clean.txt', "No valid partner/event found");
        return;
    }

    output += `Testing with Partner: ${partner.id}, Event: ${event.title}\n`;

    // Helper to check balance
    async function checkLocked() {
        const { data: payouts } = await supabaseAdmin
            .from('payouts')
            .select('amount, status')
            .eq('event_id', event.id)
            .neq('status', 'rejected');

        let locked = 0;
        payouts.forEach(p => locked += parseFloat(p.amount));
        return locked;
    }

    // 2. Initial State
    const initialLocked = await checkLocked();
    output += `Initial Locked Funds: ${initialLocked}\n`;

    // 3. Create Pending Payout
    const amount = 500;
    const { data: payout } = await supabaseAdmin.from('payouts').insert({
        partner_id: partner.id,
        event_id: event.id,
        amount: amount,
        status: 'pending',
        requested_at: new Date().toISOString()
    }).select().single();

    const pendingLocked = await checkLocked();
    output += `After Pending Request (${amount}): Locked Funds = ${pendingLocked}\n`;

    if (pendingLocked !== initialLocked + amount) output += " [FAIL] Funds not locked correctly\n";
    else output += " [PASS] Funds locked\n";

    // 4. Reject Payout
    await supabaseAdmin.from('payouts').update({ status: 'rejected' }).eq('id', payout.id);

    const rejectedLocked = await checkLocked();
    output += `After Rejecting: Locked Funds = ${rejectedLocked}\n`;

    if (rejectedLocked !== initialLocked) output += " [FAIL] Funds not released\n";
    else output += " [PASS] Funds released correctly (Rejected ignored)\n";

    // 5. Cleanup
    await supabaseAdmin.from('payouts').delete().eq('id', payout.id);

    fs.writeFileSync('test_result_clean.txt', output);
}

testRejectedFlow();
