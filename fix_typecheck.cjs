const fs = require('fs');

// Fix Chatbot.tsx types
let chatbotCode = fs.readFileSync('components/Chatbot.tsx', 'utf8');
chatbotCode = chatbotCode.replace(/const income = txs\.filter\(t => t\.type === 'income'\)\.reduce\(\(a,b\)=>a\+b\.amount,0\);/g, "const income = txs.filter((t: any) => t.type === 'income').reduce((a: any, b: any)=>a+b.amount,0);");
chatbotCode = chatbotCode.replace(/const expenses = txs\.filter\(t => t\.type !== 'income'\)\.reduce\(\(a,b\)=>a\+b\.amount,0\);/g, "const expenses = txs.filter((t: any) => t.type !== 'income').reduce((a: any, b: any)=>a+b.amount,0);");
chatbotCode = chatbotCode.replace(/t => \(\{name: t\.name, amount: t\.amount, type: t\.type\}\)/g, "(t: any) => ({name: t.name, amount: t.amount, type: t.type})");
chatbotCode = chatbotCode.replace(/t\('rateLimitError'\)/g, "t('chatbotErrorApi')");
fs.writeFileSync('components/Chatbot.tsx', chatbotCode);

// Fix server.ts types
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/const requireAuth = async \(req, res, next\) => \{/g, "const requireAuth = async (req: express.Request & { token?: string, user?: any }, res: express.Response, next: express.NextFunction) => {");
serverCode = serverCode.replace(/\.map\(\(m\) => \(\{\n        role/g, ".map((m: any) => ({\n        role");
fs.writeFileSync('server.ts', serverCode);

// Fix ReportsView.tsx
let reportsCode = fs.readFileSync('views/ReportsView.tsx', 'utf8');
reportsCode = reportsCode.replace(/t\('aiSummaryError'\) \|\| /g, ""); // Remove the t() call completely or use a valid string. Let's just use string literal for fallback.
reportsCode = reportsCode.replace(/setAiSummary\(t\('aiSummaryError'\) \|\| 'Failed to generate summary\. Please try again\.'\);/g, "setAiSummary('Failed to generate summary. Please try again.');");
fs.writeFileSync('views/ReportsView.tsx', reportsCode);

// Fix TransactionView.tsx
let transCode = fs.readFileSync('components/TransactionView.tsx', 'utf8');
transCode = transCode.replace(/t\('noData'\) \|\| /g, "");
fs.writeFileSync('components/TransactionView.tsx', transCode);

