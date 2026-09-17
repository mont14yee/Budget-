const fs = require('fs');

// AI services need the real JWT token.
// Right now, the AI components try to parse 'wallet_user' from localStorage which was from the old local-only code.
// Supabase handles session storage. We can get the token from supabase.auth.getSession().

const componentPaths = [
    'components/Chatbot.tsx',
    'views/ReportsView.tsx',
    'components/NutritionView.tsx'
];

for (const p of componentPaths) {
    let code = fs.readFileSync(p, 'utf8');
    
    // add import if missing
    if (!code.includes("import { supabase } from '../lib/supabase';")) {
        code = code.replace("import React,", "import { supabase } from '../lib/supabase';\nimport React,");
    }

    // replace dummy-token code
    const tokenReplaceRegex = /let token = 'dummy-token';\s*const stored = localStorage\.getItem\('wallet_user'\);\s*if \(stored\) \{\s*token = JSON\.parse\(stored\)\.id;\s*\}/g;
    
    const realTokenCode = `let token = 'dummy-token';
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                token = session.access_token;
            }`;
            
    code = code.replace(tokenReplaceRegex, realTokenCode);
    
    fs.writeFileSync(p, code);
}
