const fs = require('fs');

let code = fs.readFileSync('views/ReportsView.tsx', 'utf8');
const strPattern = / bg-gray-50 focus:ring-2 focus:ring-cyan-500\/30 focus:border-cyan-500(?: transition-all)? duration-300(?: outline-none)?/g;
code = code.replace(strPattern, '');
fs.writeFileSync('views/ReportsView.tsx', code);
