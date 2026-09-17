const fs = require('fs');
const path = require('path');

const brandButton = "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all rounded-xl";

const processFile = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Standard blue buttons
    const blueBtnPattern = /bg-blue-600 text-white font-bold py-2 px-4 rounded-[a-z0-9]+ hover:bg-blue-700 transition-colors/g;
    if (code.match(blueBtnPattern)) {
        code = code.replace(blueBtnPattern, brandButton + " py-2.5 px-5 flex items-center justify-center gap-2");
        changed = true;
    }
    
    // Teal buttons (e.g. TransactionView)
    const tealBtnPattern = /bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors/g;
    if (code.match(tealBtnPattern)) {
        code = code.replace(tealBtnPattern, brandButton + " py-2.5 px-5 flex items-center justify-center gap-2");
        changed = true;
    }
    
    // Currency converter button
    const ccBtnPattern = /bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed/g;
    if (code.match(ccBtnPattern)) {
        code = code.replace(ccBtnPattern, brandButton + " py-2.5 px-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100");
        changed = true;
    }

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
