const { supabaseAdmin } = require('./db');

(async () => {
    try {
        console.log('Running Payouts Table Migration...');

        const sql = `
        CREATE TABLE IF NOT EXISTS public.payouts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
          amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
          transaction_ref TEXT,
          requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
          processed_at TIMESTAMPTZ
        );

        CREATE INDEX IF NOT EXISTS idx_payouts_partner ON public.payouts(partner_id);
        CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
        `;

        const { error } = await supabaseAdmin.rpc('run_sql_query', { query: sql });

        // Note: RPC might not be enabled. If RPC fails, we rely on user running manual SQL or direct connection.
        // Assuming direct connection or just printing SQL for now if simple RPC doesn't exist.
        // Direct query via library is not typical in Supabase JS client unless using postgres-js or similar.
        // Actually, 'supabaseAdmin' is just the JS client. It can't run raw SQL unless there is a function.
        // We will TRY to define the table using JS API if possible, but JS API doesn't do CREATE TABLE.

        // Simpilified approach: We often assume user has a way to run SQL.
        // But here I must ensure it runs.
        // I will Create a Helper Function in DB via existing connection? No.

        console.log('------------------------------------------------');
        console.log('Please Run this SQL in your Supabase SQL Editor:');
        console.log(sql);
        console.log('------------------------------------------------');

    } catch (err) {
        console.error(err);
    }
})();
