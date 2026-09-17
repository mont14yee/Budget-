const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetAddLoan = `const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
        if (isNaN(item.totalAmount) || item.totalAmount <= 0) return;
        if (isNaN(item.interestRate) || item.interestRate < 0) return;
        if (!item.date || isNaN(new Date(item.date).getTime())) return;
        if (!item.dueDate || isNaN(new Date(item.dueDate).getTime())) return;
        
        const newItem: Loan = { 
            ...item, 
            id: generateId(), 
            repayments: [], 
            outstandingAmount: item.totalAmount 
        };
        try {
            await dbService.addLoan(user.id, newItem);
            setLoans(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`;

const replaceAddLoan = `const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
        if (isNaN(item.totalAmount) || item.totalAmount <= 0) return;
        if (isNaN(item.interestRate) || item.interestRate < 0) return;
        if (!item.date || isNaN(new Date(item.date).getTime())) return;
        if (!item.dueDate || isNaN(new Date(item.dueDate).getTime())) return;
        
        const newItem: Loan = { 
            ...item, 
            id: generateId(), 
            repayments: [], 
            outstandingAmount: item.totalAmount 
        };
        try {
            await dbService.addLoan(user.id, newItem);
            setLoans(prev => [...prev, newItem]);
            
            if (item.type === LoanType.Lent) {
                addTransaction(TransactionType.Expense, {
                    name: \`\${t('loanTo') || 'Loan to'} \${item.person}\`,
                    amount: item.totalAmount,
                    date: item.date,
                    category: 'Loan Disbursement',
                });
            } else {
                addTransaction(TransactionType.Income, {
                    name: \`\${t('loanFrom') || 'Loan from'} \${item.person}\`,
                    amount: item.totalAmount,
                    date: item.date,
                    category: 'Loan Received',
                });
            }
        } catch(e) { console.error(e); }
    }, [user, addTransaction, t]);`;

code = code.replace(targetAddLoan, replaceAddLoan);
fs.writeFileSync('App.tsx', code);
