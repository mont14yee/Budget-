const fs = require('fs');
let code = fs.readFileSync('components/ViewContainer.tsx', 'utf8');

code = code.replace(
    /className=\{\`\$\{bgColor\} p-4 sm:p-6 mb-6 animate-fadeIn transition-colors duration-500\`\}/,
    'className={`bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-4 sm:p-6 mb-6 animate-fadeIn transition-all duration-500 shadow-sm`}'
);

fs.writeFileSync('components/ViewContainer.tsx', code);
