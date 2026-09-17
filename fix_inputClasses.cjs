const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');

    // Replace all those inputClasses definitions with an empty string or just the specific overrides needed
    code = code.replace(/const inputClasses = "[^"]+";/g, 'const inputClasses = "";');

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
