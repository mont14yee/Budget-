const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');

    // "bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 duration-300 outline-none"
    const str1 = " bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 duration-300 outline-none";
    code = code.replace(new RegExp(str1.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '');

    // Any other variant? Let's just catch anything like bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500
    const strPattern = / bg-gray-50 dark:bg-gray-900\/50 focus:ring-2 focus:ring-cyan-500\/30 focus:border-cyan-500(?: transition-all)? duration-300(?: outline-none)?/g;
    code = code.replace(strPattern, '');

    // Now let's carefully style ONLY inputs, selects, textareas
    // We will do this properly later if needed. For now just clear the junk.
    
    // Also, there are duplicate borders like `border border-gray-200 dark:border-gray-700/50/50/50/50`?
    code = code.replace(/dark:border-gray-700\/50\/50/g, 'dark:border-gray-700/50');
    code = code.replace(/rounded-xl-3xl/g, 'rounded-3xl');
    
    if (code !== fs.readFileSync(filePath, 'utf8')) {
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
