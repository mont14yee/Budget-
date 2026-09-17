const fs = require('fs');
let code = fs.readFileSync('components/FooterNav.tsx', 'utf8');

code = code.replace(
    /bg-white\/80 dark:bg-gray-900\/80 backdrop-blur-xl rounded-full shadow-\[0_8px_32px_rgba\(0,0,0,0.08\)\] dark:shadow-\[0_8px_32px_rgba\(0,0,0,0.3\)\] border border-white\/40 dark:border-gray-700\/50/g,
    'bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 dark:border-gray-700/50'
);

code = code.replace(
    /text-teal-600\/80 dark:text-cyan-400\/80/g,
    'text-gray-400 dark:text-gray-500'
);

fs.writeFileSync('components/FooterNav.tsx', code);
