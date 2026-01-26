const { supabaseAdmin } = require('./db');
require('dotenv').config();

const checkTodayBookings = async () => {
    console.log('Checking bookings for today (2026-01-26)...');

    // Set range for today
    const startOfDay = new Date('2026-01-26T00:00:00.000Z').toISOString();
    const endOfDay = new Date('2026-01-26T23:59:59.999Z').toISOString();

    const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select(`
            id,
            total_amount,
            status,
            user:users(email)
        `)
        .eq('status', 'paid')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!bookings || bookings.length === 0) {
        console.log('No paid bookings found for today.');
        return;
    }

    console.log(`Found ${bookings.length} booking(s) for today:`);

    let totalGross = 0;

    bookings.forEach(b => {
        console.log(`- Booking ID: ${b.id} | Amount: Rs. ${b.total_amount} | User: ${b.user?.email}`);
        totalGross += parseFloat(b.total_amount);
    });

    const netRevenue = totalGross * 0.95;
    const commission = totalGross * 0.05;

    console.log('-----------------------------------');
    console.log(`TOTAL GROSS: Rs. ${totalGross}`);
    console.log(`COMMISSION (5%): Rs. ${commission}`);
    console.log(`NET REVENUE (95%): Rs. ${netRevenue}`);

    if (Math.round(netRevenue) === 8360) {
        console.log('>>> MATCH CONFIRMED: This explains the 8360 figure.');
    }
};

checkTodayBookings();
