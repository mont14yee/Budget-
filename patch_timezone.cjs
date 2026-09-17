const fs = require('fs');

const replaceInFile = (file) => {
    let code = fs.readFileSync(file, 'utf8');
    const original = code;
    
    // Replace new Date().toISOString().split('T')[0] with formatLocalDate(new Date())
    code = code.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'formatLocalDate(new Date())');
    
    // Sometimes it's a specific date
    code = code.replace(/new Date\(([^)]+)\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'formatLocalDate(new Date($1))');
    
    if (code !== original) {
        // Need to ensure formatLocalDate is imported
        if (!code.includes('formatLocalDate')) {
            if (code.includes('./constants')) {
                code = code.replace(/{([^}]+)} from '(\.\/|\.\.\/)constants'/, '{$1, formatLocalDate } from \'$2constants\'');
            } else if (code.includes('../../constants')) {
                code = "import { formatLocalDate } from '../../constants';\n" + code;
            } else if (code.includes('../constants')) {
                code = "import { formatLocalDate } from '../constants';\n" + code;
            } else {
                code = "import { formatLocalDate } from './constants';\n" + code;
            }
        }
        fs.writeFileSync(file, code);
    }
};

[
    'App.tsx',
    'views/ScheduledView.tsx',
    'views/InvestmentsView.tsx',
    'views/ActivityLogView.tsx',
    'views/CalculatorView.tsx',
    'views/DashboardView.tsx',
    'views/LoansView.tsx',
    'views/SavingsView.tsx',
    'views/ReportsView.tsx',
    'components/TransactionView.tsx',
].forEach(replaceInFile);

