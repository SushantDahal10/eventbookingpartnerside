require('dotenv').config();
const { supabaseAdmin } = require('./db');

const main = async () => {
    try {
        console.log('Adding address columns to partners table...');

        // 1. Country
        const { error: e1 } = await supabaseAdmin.rpc('run_sql', { sql: 'ALTER TABLE public.partners ADD COLUMN country TEXT;' });
        if (e1) console.log('Country column might already exist or RPC not setup. Manual run needed: ALTER TABLE public.partners ADD COLUMN country TEXT;');

        // 2. State
        const { error: e2 } = await supabaseAdmin.rpc('run_sql', { sql: 'ALTER TABLE public.partners ADD COLUMN state TEXT;' });

        // 3. City
        const { error: e3 } = await supabaseAdmin.rpc('run_sql', { sql: 'ALTER TABLE public.partners ADD COLUMN city TEXT;' });

        // 4. Full Address
        const { error: e4 } = await supabaseAdmin.rpc('run_sql', { sql: 'ALTER TABLE public.partners ADD COLUMN full_address TEXT;' });

        console.log('Migration steps initiated. If you see errors, run SQL manually.');
        console.log(`
        ALTER TABLE public.partners 
        ADD COLUMN country TEXT,
        ADD COLUMN state TEXT,
        ADD COLUMN city TEXT,
        ADD COLUMN full_address TEXT;
        `);

    } catch (err) {
        console.error(err);
    }
};
main();
