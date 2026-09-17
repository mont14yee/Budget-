const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Standard text/number/date inputs
    const inputPattern = /className="([^"]*(?:border|p-2|w-full)[^"]*)"/g;
    
    code = code.replace(inputPattern, (match, classes) => {
        if (!classes.includes('input') && (classes.includes('border') || classes.includes('w-full') || classes.includes('p-2'))) {
            // Check if it's likely an input
            if (classes.includes('rounded') && !classes.includes('bg-white/60')) {
                const newClasses = classes
                    .replace(/border-gray-[34]00/g, 'border-gray-200 dark:border-gray-700/50')
                    .replace(/border /g, 'border ')
                    .replace(/dark:border-gray-[67]00/g, 'dark:border-gray-700/50')
                    .replace(/rounded(?:-[a-z]+)?/g, 'rounded-xl')
                    + ' bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300 outline-none';
                
                // Deduplicate classes
                const uniqueClasses = [...new Set(newClasses.split(' '))].join(' ');
                changed = true;
                return `className="${uniqueClasses}"`;
            }
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(filePath, code);
    }
};

const dirs = ['views', 'components'];
dirs.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.tsx')) {
            processFile(path.join(dir, file));
        }
    });
});
