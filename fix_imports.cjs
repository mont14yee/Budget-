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
    
    // Clean up the messed up syntax
    code = code.replace(/} , formatLocalDate } from/g, "} from");
    code = code.replace(/import { formatLocalDate, /g, "import { ");
    
    // Now add formatLocalDate correctly if it doesn't exist
    if (code.includes('formatLocalDate') && !code.includes('formatLocalDate,')) {
        if (code.includes('./constants')) {
            code = code.replace(/} from '\.\/constants';/, ", formatLocalDate } from './constants';");
        } else if (code.includes('../../constants')) {
            code = code.replace(/} from '\.\.\/\.\.\/constants';/, ", formatLocalDate } from '../../constants';");
        } else if (code.includes('../constants')) {
            code = code.replace(/} from '\.\.\/constants';/, ", formatLocalDate } from '../constants';");
        }
    }
    
    fs.writeFileSync(file, code);
});

