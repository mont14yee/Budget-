const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// addExtraContribution
code = code.replace(
    /const addExtraContribution = useCallback\(async \(goalId: number, contribution: Omit<ExtraContribution, 'id'>\) => \{\n        try \{\n            \n            const goal = savingsGoals\.find\(g => g\.id === goalId\);\n            if \(\!goal\) return;\n            const updated = \{\n                \.\.\.goal,\n                startingBalance: addMoney\(goal\.startingBalance, contribution\.amount\),\n                extraContributions: \[\{ \.\.\.contribution, id: generateId\(\) \}, \.\.\.\(goal\.extraContributions \|\| \[\]\)\]\n            \};\n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'savingsGoals', goalId\.toString\(\)\), updated\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.UPDATE, 'users\/savingsGoals'\); \}\n    \}, \[savingsGoals\]\);/g,
    `const addExtraContribution = useCallback(async (goalId: string, contribution: Omit<ExtraContribution, 'id'>) => {
        if (!user) return;
        try {
            const goal = savingsGoals.find(g => g.id === goalId);
            if (!goal) return;
            const updated = {
                ...goal,
                startingBalance: addMoney(goal.startingBalance, contribution.amount),
                extraContributions: [{ ...contribution, id: generateId() }, ...(goal.extraContributions || [])]
            };
            await dbService.updateSavingsGoal(user.id, updated);
            setSavingsGoals(prev => prev.map(g => g.id === goalId ? updated : g));
        } catch(e) { console.error(e); }
    }, [user, savingsGoals]);`
);

// addLoan
code = code.replace(
    /const addLoan = useCallback\(async \(item: Omit<Loan, 'id' \| 'repayments' \| 'outstandingAmount'>\) => \{\n        const newItem: Loan = \{ \n            \.\.\.item, \n            id: generateId\(\), \n            repayments: \[\], \n            outstandingAmount: item\.totalAmount \n        \};\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'loans', newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users\/loans'\); \}\n    \}, \[\]\);/g,
    `const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
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
    }, [user]);`
);

// addRepaymentToLoan
code = code.replace(
    /const addRepaymentToLoan = useCallback\(async \(loanId: number, repayment: Omit<Repayment, 'id'>\) => \{\n        try \{\n            \n            const loan = loans\.find\(l => l\.id === loanId\);\n            if \(\!loan\) return;\n            const newRepayment = \{ \.\.\.repayment, id: generateId\(\) \};\n            const updated = \{\n                \.\.\.loan,\n                outstandingAmount: Math\.max\(0, subtractMoney\(loan\.outstandingAmount, repayment\.amount\)\),\n                repayments: \[newRepayment, \.\.\.\(loan\.repayments \|\| \[\]\)\]\n            \};\n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'loans', loanId\.toString\(\)\), updated\);\n            \n            if \(loan\.type === LoanType\.Lent\) \{\n                addTransaction\(TransactionType\.Income, \{\n                    name: `\$\{t\('repaymentFrom'\)\} \$\{loan\.person\}`,\n                    amount: repayment\.amount,\n                    date: repayment\.date,\n                    category: 'Loan Repayment',\n                \}\);\n            \} else \{\n                addTransaction\(TransactionType\.Expense, \{\n                    name: `\$\{t\('repaymentTo'\)\} \$\{loan\.person\}`,\n                    amount: repayment\.amount,\n                    date: repayment\.date,\n                    category: 'Loan Repayment',\n                \}\);\n            \}\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.UPDATE, 'users\/loans'\); \}\n    \}, \[loans, addTransaction, t\]\);/g,
    `const addRepaymentToLoan = useCallback(async (loanId: string, repayment: Omit<Repayment, 'id'>) => {
        if (!user) return;
        try {
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return;
            const newRepayment = { ...repayment, id: generateId() };
            const updated = {
                ...loan,
                outstandingAmount: Math.max(0, subtractMoney(loan.outstandingAmount, repayment.amount)),
                repayments: [newRepayment, ...(loan.repayments || [])]
            };
            await dbService.updateLoan(user.id, updated);
            setLoans(prev => prev.map(l => l.id === loanId ? updated : l));
            
            if (loan.type === LoanType.Lent) {
                addTransaction(TransactionType.Income, {
                    name: \`\${t('repaymentFrom')} \${loan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Repayment',
                });
            } else {
                addTransaction(TransactionType.Expense, {
                    name: \`\${t('repaymentTo')} \${loan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Repayment',
                });
            }
        } catch(e) { console.error(e); }
    }, [user, loans, addTransaction, t]);`
);

fs.writeFileSync('App.tsx', code);
