const { supabaseAdmin } = require('./db');

(async () => {
    try {
        console.log('Running Event Cancellation Schema Migration...');

        const sql = `
        ALTER TABLE public.events 
        ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
        ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
        `;

        console.log('--- SQL TO RUN ---');
        console.log(sql);
        console.log('------------------');

        // Optional: Run if RPC enabled
        // await supabaseAdmin.rpc('run_sql_query', { query: sql });

    } catch (err) {
        console.error(err);
    }
})();
