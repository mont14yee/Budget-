const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The replacement logic for /api/report-summary introduced a duplicated block or didn't fully overwrite. Let's fix it by regex or substring.
code = code.replace(/      const response = await ai\.models\.generateContent\(\{\n        model: "gemini-2\.5-flash",\n        contents: prompt,\n      \}\);\n      res\.json\(\{ text: response\.text \}\);\n    \} catch \(e\) \{\n      console\.error\(e\);\n      res\.status\(500\)\.json\(\{ error: e instanceof Error \? e\.message : String\(e\) \}\);\n    \}\n  \}\);\n/m, '');

fs.writeFileSync('server.ts', code);
