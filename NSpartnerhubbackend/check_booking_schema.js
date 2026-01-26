const { supabaseAdmin } = require('./db');
require('dotenv').config();

const checkSchema = async () => {
    console.log('Checking Booking Schema...');

    // Check if there is a 'tickets' or 'booking_items' table
    const { data: tables } = await supabaseAdmin.rpc('get_tables'); // Won't work if rpc not defined.
    // Better just select from bookings and see if we see any quantity.

    const { data: oneBooking } = await supabaseAdmin.from('bookings').select('*').limit(1);

    if (oneBooking && oneBooking.length > 0) {
        console.log('Booking Keys:', Object.keys(oneBooking[0]));
        console.log('Sample Booking:', JSON.stringify(oneBooking[0], null, 2));

        // Check for 'tickets' table?
        const { data: tickets } = await supabaseAdmin.from('tickets').select('*').limit(1);
        if (tickets) console.log('Found tickets table:', Object.keys(tickets[0] || {}));
        else console.log('No tickets table found directly accessible.');

    } else {
        console.log('No bookings found.');
    }
};

checkSchema();
