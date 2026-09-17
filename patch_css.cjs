const fs = require('fs');
let code = fs.readFileSync('index.css', 'utf8');
code = code.replace(/@layer base \{\n  \* \{\n    @apply border-border;\n  \}\n  body \{\n    @apply bg-background text-foreground antialiased;\n  \}\n\}/g, '');
fs.writeFileSync('index.css', code);
