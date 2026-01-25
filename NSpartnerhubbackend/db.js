require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate Config
if (!supabaseUrl || !supabaseUrl.startsWith('http') || supabaseUrl === 'your_supabase_url') {
    console.error('\x1b[31m%s\x1b[0m', '--------------------------------------------------------------------------------');
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Invalid SUPABASE_URL in .env');
    console.error('\x1b[31m%s\x1b[0m', 'Please open "NSpartnerhubbackend/.env" and replace the placeholders with your actual Supabase keys.');
    console.error('\x1b[31m%s\x1b[0m', '--------------------------------------------------------------------------------');
    process.exit(1);
}

if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Invalid SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for backend operations
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin = null;

if (serviceRoleKey && serviceRoleKey !== 'your_service_role_key') {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
} else {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: SUPABASE_SERVICE_ROLE_KEY not configured. Admin operations (Registration) will fail.');
}

module.exports = { supabase, supabaseAdmin };
