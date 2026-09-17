const fs = require('fs');

const files = [
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
    
    // Check if formatLocalDate is used
    if (code.includes('formatLocalDate(')) {
        // Find the import line for constants
        const constantsImportRegex = /import\s+{([^}]+)}\s+from\s+['"]\.\.\/constants['"];/;
        const match = code.match(constantsImportRegex);
        
        if (match) {
            if (!match[1].includes('formatLocalDate')) {
                const newImport = match[0].replace(match[1], match[1] + ', formatLocalDate');
                code = code.replace(match[0], newImport);
            }
        } else {
            code = "import { formatLocalDate } from '../constants';\n" + code;
        }
        
        fs.writeFileSync(file, code);
    }
});
