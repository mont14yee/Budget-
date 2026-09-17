const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Fix the require('@supabase/supabase-js')
code = code.replace("const { createClient } = require('@supabase/supabase-js');", '');
if (!code.includes("import { createClient }")) {
    code = code.replace('import { GoogleGenAI, Type } from "@google/genai";', 'import { GoogleGenAI, Type } from "@google/genai";\nimport { createClient } from "@supabase/supabase-js";');
}

// Fix express-rate-limit keyGenerator
code = code.replace(/    keyGenerator: \(req\) => \{\n      return req\.ip \|\| 'unknown';\n    \},\n/, '');

fs.writeFileSync('server.ts', code);
