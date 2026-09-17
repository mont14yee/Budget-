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
    if (code.includes('formatLocalDate') && !code.includes('import { formatLocalDate')) {
        if (code.includes("from '../constants'")) {
            code = code.replace("from '../constants';", ", formatLocalDate } from '../constants';").replace("import { ", "import { formatLocalDate, ");
        } else if (code.includes("from './constants'")) {
            code = code.replace("from './constants';", ", formatLocalDate } from './constants';").replace("import { ", "import { formatLocalDate, ");
        } else {
            const prefix = file.includes('/') ? "../" : "./";
            code = `import { formatLocalDate } from '${prefix}constants';\n` + code;
        }
        fs.writeFileSync(file, code);
    }
});

