const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/      \}\);\n      res\.json\(\{ text: response\.text \}\);\n    \} catch \(e\) \{\n      console\.error\(e\);\n      res\.status\(500\)\.json\(\{ error: e instanceof Error \? e\.message : String\(e\) \}\);\n    \}\n  \}\);\n    app\.post\("\/api\/report-summary", async \(req, res\) => \{/m, '    app.post("/api/report-summary", async (req, res) => {');
fs.writeFileSync('server.ts', code);
