const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// addTransaction validation
const targetAddTransaction = `const addTransaction = useCallback(async (type: TransactionType, item: Omit<Transaction, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };`;
        
const replaceAddTransaction = `const addTransaction = useCallback(async (type: TransactionType, item: Omit<Transaction, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.date || isNaN(new Date(item.date).getTime())) return;
        
        const newItem = { ...item, id: generateId() };`;
        
code = code.replace(targetAddTransaction, replaceAddTransaction);

// addSavingsGoal validation
const targetAddSavingsGoal = `const addSavingsGoal = useCallback(async (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId(), extraContributions: [] };`;
        
const replaceAddSavingsGoal = `const addSavingsGoal = useCallback(async (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        if (!user) return;
        if (isNaN(item.targetAmount) || item.targetAmount <= 0) return;
        if (isNaN(item.startingBalance) || item.startingBalance < 0) return;
        if (isNaN(item.monthlyContribution) || item.monthlyContribution < 0) return;
        if (isNaN(item.interestRate) || item.interestRate < 0) return;
        if (!item.deadline || isNaN(new Date(item.deadline).getTime())) return;

        const newItem = { ...item, id: generateId(), extraContributions: [] };`;

code = code.replace(targetAddSavingsGoal, replaceAddSavingsGoal);

// addExtraContribution validation
const targetAddExtraContribution = `const addExtraContribution = useCallback(async (goalId: string, contribution: Omit<ExtraContribution, 'id'>) => {
        if (!user) return;
        try {`;
        
const replaceAddExtraContribution = `const addExtraContribution = useCallback(async (goalId: string, contribution: Omit<ExtraContribution, 'id'>) => {
        if (!user) return;
        if (isNaN(contribution.amount) || contribution.amount <= 0) return;
        if (!contribution.date || isNaN(new Date(contribution.date).getTime())) return;
        try {`;

code = code.replace(targetAddExtraContribution, replaceAddExtraContribution);

// addLoan validation
const targetAddLoan = `const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
        const newItem: Loan = {`;
        
const replaceAddLoan = `const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
        if (isNaN(item.totalAmount) || item.totalAmount <= 0) return;
        if (isNaN(item.interestRate) || item.interestRate < 0) return;
        if (!item.date || isNaN(new Date(item.date).getTime())) return;
        if (!item.dueDate || isNaN(new Date(item.dueDate).getTime())) return;
        
        const newItem: Loan = {`;

code = code.replace(targetAddLoan, replaceAddLoan);

// addRepaymentToLoan validation
const targetAddRepayment = `const addRepaymentToLoan = useCallback(async (loanId: string, repayment: Omit<Repayment, 'id'>) => {
        if (!user) return;
        try {`;
        
const replaceAddRepayment = `const addRepaymentToLoan = useCallback(async (loanId: string, repayment: Omit<Repayment, 'id'>) => {
        if (!user) return;
        if (isNaN(repayment.amount) || repayment.amount <= 0) return;
        if (!repayment.date || isNaN(new Date(repayment.date).getTime())) return;
        try {`;

code = code.replace(targetAddRepayment, replaceAddRepayment);

// addSubscription validation
const targetAddSub = `const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };`;
        
const replaceAddSub = `const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.renewalDate || isNaN(new Date(item.renewalDate).getTime())) return;
        
        const newItem = { ...item, id: generateId() };`;

code = code.replace(targetAddSub, replaceAddSub);

// addScheduledTransaction validation
const targetAddSched = `const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };`;
        
const replaceAddSched = `const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.startDate || isNaN(new Date(item.startDate).getTime())) return;
        
        const newItem = { ...item, id: generateId() };`;

code = code.replace(targetAddSched, replaceAddSched);

// updateInvestment validation (preventing negative price/quantity)
const targetUpdateInv = `const updateInvestment = useCallback(async (updatedItem: Investment) => {
        if (!user) return;
        try {`;
        
const replaceUpdateInv = `const updateInvestment = useCallback(async (updatedItem: Investment) => {
        if (!user) return;
        if (isNaN(updatedItem.quantity) || updatedItem.quantity < 0) return;
        if (isNaN(updatedItem.currentPrice) || updatedItem.currentPrice < 0) return;
        if (isNaN(updatedItem.purchasePrice) || updatedItem.purchasePrice < 0) return;
        try {`;
code = code.replace(targetUpdateInv, replaceUpdateInv);


fs.writeFileSync('App.tsx', code);
