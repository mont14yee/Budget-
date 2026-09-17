const fs = require('fs');
const path = require('path');

const dirs = ['components', 'views'];
for (const dir of dirs) {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.tsx')) {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            if (content.length < 50) {
                console.log('Empty or small file:', path.join(dir, file));
            }
        }
    });
}
