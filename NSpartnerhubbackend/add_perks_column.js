const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrate() {
    try {
        console.log('Adding perks column to ticket_tiers...');

        await pool.query(`
      ALTER TABLE public.ticket_tiers
      ADD COLUMN IF NOT EXISTS perks JSONB DEFAULT '[]'::jsonb;
    `);

        console.log('Successfully added perks column.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        const client = await pool.connect();
        await client.release(); // Just ensuring connection is good
        await pool.end();
    }
}

migrate();
