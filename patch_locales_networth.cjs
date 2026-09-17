const fs = require('fs');

const enFile = 'locales/en.ts';
let enCode = fs.readFileSync(enFile, 'utf8');
if (!enCode.includes('netWorth:')) {
    enCode = enCode.replace("assets:", "netWorth: 'Net Worth',\n    assets:");
    fs.writeFileSync(enFile, enCode);
}

const amFile = 'locales/am.ts';
let amCode = fs.readFileSync(amFile, 'utf8');
if (!amCode.includes('netWorth:')) {
    amCode = amCode.replace("assets:", "netWorth: 'የተጣራ ሀብት',\n    assets:");
    fs.writeFileSync(amFile, amCode);
}
