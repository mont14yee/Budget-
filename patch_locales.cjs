const fs = require('fs');

const enFile = 'locales/en.ts';
let enCode = fs.readFileSync(enFile, 'utf8');
enCode = enCode.replace("sell: 'Sell',", "sell: 'Sell',\n    buy: 'Buy',\n    investmentPurchaseCategory: 'Investment Purchase',\n    investmentSaleCategory: 'Investment Sale',");
fs.writeFileSync(enFile, enCode);

const amFile = 'locales/am.ts';
let amCode = fs.readFileSync(amFile, 'utf8');
amCode = amCode.replace("sell: 'ሽጥ',", "sell: 'ሽጥ',\n    buy: 'ግዛ',\n    investmentPurchaseCategory: 'የኢንቨስትመንት ግዢ',\n    investmentSaleCategory: 'የኢንቨስትመንት ሽያጭ',");
fs.writeFileSync(amFile, amCode);

