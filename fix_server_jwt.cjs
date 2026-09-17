const fs = require('fs');

// We need to implement proper JWT verification in the server if we want it to be secure.
// Since Supabase signs the JWT with the JWT Secret, we could verify it using jsonwebtoken.
// But we don't have the SUPABASE_JWT_SECRET on the server by default. 
// A simpler robust check without adding new env vars is to use the supabase-js client with the anon key and set the session or get user.
// Let's rewrite the requireAuth middleware to actually verify using @supabase/supabase-js

const code = fs.readFileSync('server.ts', 'utf8');

const newRequireAuth = `
  const { createClient } = require('@supabase/supabase-js');
  
  // Note: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be in process.env when server runs.
  // Actually, VITE_ prefixed vars might not be in process.env depending on how it's started, but AI Studio injects them.
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
  );

  const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    req.user = user;
    next();
  };
`;

let newCode = code.replace(/  const requireAuth = \(req, res, next\) => \{[\s\S]*?  \};\n/m, newRequireAuth);

fs.writeFileSync('server.ts', newCode);
