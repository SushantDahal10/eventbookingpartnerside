const { supabaseAdmin } = require('./db');

(async () => {
    try {
        console.log('Running Ledger Migration...');

        // 1. Transaction Table
        const sqlTransactions = `
        CREATE TABLE IF NOT EXISTS public.transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('sale', 'payout', 'fee', 'refund')),
          amount NUMERIC(12,2) NOT NULL,
          reference_id UUID,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT now() NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_partner ON public.transactions(partner_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_event ON public.transactions(event_id);
        `;

        // 2. Add event_id to Payouts if not exists
        // Note: Doing this cleanly in raw SQL without knowing current state is hard.
        // We assume user runs typical migration.
        const sqlAlterPayouts = `
        ALTER TABLE public.payouts 
        ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_payouts_event ON public.payouts(event_id);
        `;

        console.log('--- SQL TO RUN ---');
        console.log(sqlTransactions);
        console.log(sqlAlterPayouts);
        console.log('------------------');

        // Optional: Attempt to run via RPC if configured
        // const { error } = await supabaseAdmin.rpc('run_sql_query', { query: sqlTransactions });

    } catch (err) {
        console.error(err);
    }
})();
