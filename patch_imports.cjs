const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');
code = code.replace(
    "import { ViewType, Transaction, SavingsGoal, TransactionType, AllTransaction, UserProfile, FeatureType, Loan, LoanType, Repayment, ExtraContribution, Subscription, ScheduledTransaction, Investment } from './types';",
    "import { ViewType, Transaction, SavingsGoal, TransactionType, AllTransaction, UserProfile, FeatureType, Loan, LoanType, Repayment, ExtraContribution, Subscription, ScheduledTransaction, Investment, Frequency } from './types';"
);
fs.writeFileSync('App.tsx', code);
