const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/    \} catch \(e\) \{\n      console\.error\(e\);\n      res\.status\(500\)\.json\(\{ error: e instanceof Error \? e\.message : String\(e\) \}\);\n    \}\n  \}\);\n      const response = await ai\.models\.generateContent\(\{/m, '      const response = await ai.models.generateContent({');
fs.writeFileSync('server.ts', code);
