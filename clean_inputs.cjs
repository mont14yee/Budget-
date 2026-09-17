const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // We only care about cleaning up input and select classes
    // since we added global styles.
    code = code.replace(/<input([^>]+)className="([^"]+)"/g, (match, before, classes) => {
        let newClasses = classes
            .replace(/border-gray-300/g, '')
            .replace(/dark:border-gray-600/g, '')
            .replace(/border-gray-200/g, '')
            .replace(/dark:border-gray-700\/50/g, '')
            .replace(/rounded(?:-[a-z]+)?/g, '')
            .replace(/bg-gray-50/g, '')
            .replace(/dark:bg-gray-900\/50/g, '')
            .replace(/dark:bg-gray-800/g, '')
            .replace(/focus:[^\s]+/g, '')
            .replace(/shadow-sm/g, '')
            .replace(/outline-none/g, '')
            .replace(/\s+/g, ' ').trim();
        
        return `<input${before}className="${newClasses}"`;
    });
    
    code = code.replace(/<select([^>]+)className="([^"]+)"/g, (match, before, classes) => {
        let newClasses = classes
            .replace(/border-gray-300/g, '')
            .replace(/dark:border-gray-600/g, '')
            .replace(/border-gray-200/g, '')
            .replace(/dark:border-gray-700\/50/g, '')
            .replace(/rounded(?:-[a-z]+)?/g, '')
            .replace(/bg-gray-50/g, '')
            .replace(/dark:bg-gray-900\/50/g, '')
            .replace(/dark:bg-gray-800/g, '')
            .replace(/focus:[^\s]+/g, '')
            .replace(/shadow-sm/g, '')
            .replace(/outline-none/g, '')
            .replace(/\s+/g, ' ').trim();
        
        return `<select${before}className="${newClasses}"`;
    });
    
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
