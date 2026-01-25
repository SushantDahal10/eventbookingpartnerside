const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client (Service Role needed to check Admin table reliably without RLS issues? 
// Actually, for middleware, we might receive a user token. 
// We can use the Service Role to CHECK if the user is in the admins table.)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // 1. Verify User with Supabase Auth
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // 2. Check if User is in 'admins' table
        const { data: adminData, error: adminError } = await supabaseAdmin
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single();

        if (adminError || !adminData) {
            return res.status(403).json({ error: 'Access denied: Admins only.' });
        }

        // Attach user to request
        req.user = user;
        req.isAdmin = true;
        next();

    } catch (err) {
        console.error('Admin Middleware Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = requireAdmin;
