const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix rounded-xl-3xl and rounded-xl-2xl
    if (code.includes('rounded-xl-3xl')) {
        code = code.replace(/rounded-xl-3xl/g, 'rounded-3xl');
        changed = true;
    }
    if (code.includes('rounded-xl-2xl')) {
        code = code.replace(/rounded-xl-2xl/g, 'rounded-2xl');
        changed = true;
    }

    // Fix dark:border-gray-700/50/50
    if (code.includes('dark:border-gray-700/50/50')) {
        code = code.replace(/dark:border-gray-700\/50\/50/g, 'dark:border-gray-700/50');
        changed = true;
    }

    // Remove the appended classes from non-input elements
    // This is a bit tricky, but we can look for the specific appended string and remove it
    // if it's not in an <input ...> tag.
    // Let's just remove the exact appended string from EVERYTHING that isn't an input tag.
    // Actually, we can use a regex to match tags.
    const appendedStr = " bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300 outline-none";
    
    // We can just remove the string everywhere, and then ONLY apply it carefully to <input> tags later if needed,
    // or just remove it from div/button/form/section/header/main/article/p/span
    
    code = code.replace(new RegExp(appendedStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '');
    
    // also remove it without leading space if it exists
    code = code.replace(new RegExp(appendedStr.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '');
    
    // There was an earlier appended string: " bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300"
    const appendedStr2 = " bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300";
    code = code.replace(new RegExp(appendedStr2.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(?! outline-none)', 'g'), '');

    // Now let's fix <input> classes explicitly. We know what inputs are.
    // We can do this in a separate pass.
    
    // Check if we changed anything
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
