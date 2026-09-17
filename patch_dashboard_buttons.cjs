const fs = require('fs');
let code = fs.readFileSync('views/DashboardView.tsx', 'utf8');

code = code.replace(/bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-gray-900/g, 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all');

fs.writeFileSync('views/DashboardView.tsx', code);
