const fs = require('fs');

const files = [
    'App.tsx',
    'components/TransactionView.tsx',
    'views/ActivityLogView.tsx',
    'views/CalculatorView.tsx',
    'views/InvestmentsView.tsx',
    'views/LoansView.tsx',
    'views/ReportsView.tsx',
    'views/SavingsView.tsx',
    'views/ScheduledView.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    if (code.includes('formatLocalDate') && !code.includes('import {') && !code.includes('formatLocalDate }')) {
        if (file.includes('components/') || file.includes('views/')) {
            code = "import { formatLocalDate } from '../constants';\n" + code;
        } else {
            code = "import { formatLocalDate } from './constants';\n" + code;
        }
    } else if (code.includes('formatLocalDate') && code.includes("from '../constants'") && !code.includes('formatLocalDate')) {
        code = code.replace(/import {([^}]+)} from '\.\.\/constants'/, "import { $1, formatLocalDate } from '../constants'");
    } else if (code.includes('formatLocalDate') && code.includes("from './constants'") && !code.includes('formatLocalDate')) {
        code = code.replace(/import {([^}]+)} from '\.\/constants'/, "import { $1, formatLocalDate } from './constants'");
    }
    fs.writeFileSync(file, code);
});

// Add loanTo and loanFrom to locales
const enFile = 'locales/en.ts';
let enCode = fs.readFileSync(enFile, 'utf8');
enCode = enCode.replace("buy: 'Buy',", "buy: 'Buy',\n    loanTo: 'Loan to',\n    loanFrom: 'Loan from',");
fs.writeFileSync(enFile, enCode);

const amFile = 'locales/am.ts';
let amCode = fs.readFileSync(amFile, 'utf8');
amCode = amCode.replace("buy: 'ግዛ',", "buy: 'ግዛ',\n    loanTo: 'ለ',\n    loanFrom: 'ከ',");
fs.writeFileSync(amFile, amCode);

