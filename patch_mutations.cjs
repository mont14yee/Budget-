const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// addTransaction
code = code.replace(
    /const addTransaction = useCallback\(async \(type: TransactionType, item: Omit<Transaction, 'id'>\) => \{\n        const newItem = \{ \.\.\.item, id: generateId\(\) \};\n        try \{\n            \n            const colName = type === TransactionType\.Income \? 'income' : 'expenses';\n            await setDoc\(doc\(db, 'users', getDeviceId\(\), colName, newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users'\); \}\n    \}, \[\]\);/g,
    `const addTransaction = useCallback(async (type: TransactionType, item: Omit<Transaction, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };
        try {
            if (type === TransactionType.Income) {
                await dbService.addIncome(user.id, newItem);
                setIncome(prev => [...prev, newItem]);
            } else {
                await dbService.addExpense(user.id, newItem);
                setExpenses(prev => [...prev, newItem]);
            }
        } catch(e) { console.error(e); }
    }, [user]);`
);

// deleteTransaction
code = code.replace(
    /const deleteTransaction = useCallback\(async \(type: TransactionType, id: string\) => \{\n        try \{\n            \n            const colName = type === TransactionType\.Income \? 'income' : 'expenses';\n            await deleteDoc\(doc\(db, 'users', getDeviceId\(\), colName, id\.toString\(\)\)\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.DELETE, 'users'\); \}\n    \}, \[\]\);/g,
    `const deleteTransaction = useCallback(async (type: TransactionType, id: string) => {
        if (!user) return;
        try {
            if (type === TransactionType.Income) {
                await dbService.deleteIncome(user.id, id);
                setIncome(prev => prev.filter(i => i.id !== id));
            } else {
                await dbService.deleteExpense(user.id, id);
                setExpenses(prev => prev.filter(i => i.id !== id));
            }
        } catch(e) { console.error(e); }
    }, [user]);`
);

// addSavingsGoal
code = code.replace(
    /const addSavingsGoal = useCallback\(async \(item: Omit<SavingsGoal, 'id' \| 'extraContributions'>\) => \{\n        const newItem = \{ \.\.\.item, id: generateId\(\), extraContributions: \[\] \};\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'savingsGoals', newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users\/savingsGoals'\); \}\n    \}, \[\]\);/g,
    `const addSavingsGoal = useCallback(async (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId(), extraContributions: [] };
        try {
            await dbService.addSavingsGoal(user.id, newItem);
            setSavingsGoals(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`
);

// deleteSavingsGoal
code = code.replace(
    /const deleteSavingsGoal = useCallback\(async \(id: string\) => \{\n        try \{\n            \n            await deleteDoc\(doc\(db, 'users', getDeviceId\(\), 'savingsGoals', id\.toString\(\)\)\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.DELETE, 'users\/savingsGoals'\); \}\n    \}, \[\]\);/g,
    `const deleteSavingsGoal = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteSavingsGoal(user.id, id);
            setSavingsGoals(prev => prev.filter(g => g.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// addExtraContribution
code = code.replace(
    /const addExtraContribution = useCallback\(async \(goalId: string, contribution: Omit<ExtraContribution, 'id'>\) => \{\n        const goal = savingsGoals\.find\(g => g\.id === goalId\);\n        if \(\!goal\) return;\n        try \{\n            const updated = \{\n                \.\.\.goal,\n                extraContributions: \[\{ \.\.\.contribution, id: generateId\(\) \}, \.\.\.\(goal\.extraContributions \|\| \[\]\)\]\n            \};\n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'savingsGoals', goalId\.toString\(\)\), updated\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.UPDATE, 'users\/savingsGoals'\); \}\n    \}, \[savingsGoals\]\);/g,
    `const addExtraContribution = useCallback(async (goalId: string, contribution: Omit<ExtraContribution, 'id'>) => {
        if (!user) return;
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal) return;
        try {
            const updated = {
                ...goal,
                extraContributions: [{ ...contribution, id: generateId() }, ...(goal.extraContributions || [])]
            };
            await dbService.updateSavingsGoal(user.id, updated);
            setSavingsGoals(prev => prev.map(g => g.id === goalId ? updated : g));
        } catch(e) { console.error(e); }
    }, [user, savingsGoals]);`
);

// addLoan
code = code.replace(
    /const addLoan = useCallback\(async \(item: Omit<Loan, 'id' \| 'repayments' \| 'outstandingAmount'>\) => \{\n        const newItem: Loan = \{\n            \.\.\.item,\n            id: generateId\(\),\n            outstandingAmount: item\.totalAmount,\n            repayments: \[\]\n        \};\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'loans', newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users\/loans'\); \}\n    \}, \[\]\);/g,
    `const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
        const newItem: Loan = {
            ...item,
            id: generateId(),
            outstandingAmount: item.totalAmount,
            repayments: []
        };
        try {
            await dbService.addLoan(user.id, newItem);
            setLoans(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`
);

// deleteLoan
code = code.replace(
    /const deleteLoan = useCallback\(async \(id: string\) => \{\n        try \{\n            \n            await deleteDoc\(doc\(db, 'users', getDeviceId\(\), 'loans', id\.toString\(\)\)\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.DELETE, 'users\/loans'\); \}\n    \}, \[\]\);/g,
    `const deleteLoan = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteLoan(user.id, id);
            setLoans(prev => prev.filter(l => l.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// addRepayment
code = code.replace(
    /const addRepayment = useCallback\(async \(loanId: string, repayment: Omit<Repayment, 'id'>\) => \{\n        const loan = loans\.find\(l => l\.id === loanId\);\n        if \(\!loan\) return;\n\n        const newRepayment = \{ \.\.\.repayment, id: generateId\(\) \};\n        try \{\n            const updated = \{\n                \.\.\.loan,\n                outstandingAmount: subtractMoney\(loan\.outstandingAmount, repayment\.amount\),\n                repayments: \[newRepayment, \.\.\.\(loan\.repayments \|\| \[\]\)\]\n            \};\n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'loans', loanId\.toString\(\)\), updated\);\n            \n            if \(loan\.type === LoanType\.Lent\) \{\n                addTransaction\(TransactionType\.Income, \{\n                    name: `\$\{t\('repaymentFrom'\)\} \$\{loan\.person\}`,\n                    amount: repayment\.amount,\n                    date: repayment\.date,\n                    category: 'Loan Repayment',\n                \}\);\n            \} else \{\n                addTransaction\(TransactionType\.Expense, \{\n                    name: `\$\{t\('repaymentTo'\)\} \$\{loan\.person\}`,\n                    amount: repayment\.amount,\n                    date: repayment\.date,\n                    category: 'Loan Repayment',\n                \}\);\n            \}\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.UPDATE, 'users\/loans'\); \}\n    \}, \[loans, addTransaction, t\]\);/g,
    `const addRepayment = useCallback(async (loanId: string, repayment: Omit<Repayment, 'id'>) => {
        if (!user) return;
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return;

        const newRepayment = { ...repayment, id: generateId() };
        try {
            const updated = {
                ...loan,
                outstandingAmount: subtractMoney(loan.outstandingAmount, repayment.amount),
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

// addSubscription
code = code.replace(
    /const addSubscription = useCallback\(async \(item: Omit<Subscription, 'id'>\) => \{\n        const newItem = \{ \.\.\.item, id: generateId\(\) \};\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'subscriptions', newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users\/subscriptions'\); \}\n    \}, \[\]\);/g,
    `const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addSubscription(user.id, newItem);
            setSubscriptions(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`
);

// updateSubscription
code = code.replace(
    /const updateSubscription = useCallback\(async \(updatedItem: Subscription\) => \{\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'subscriptions', updatedItem\.id\.toString\(\)\), updatedItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.UPDATE, 'users\/subscriptions'\); \}\n    \}, \[\]\);/g,
    `const updateSubscription = useCallback(async (updatedItem: Subscription) => {
        if (!user) return;
        try {
            await dbService.updateSubscription(user.id, updatedItem);
            setSubscriptions(prev => prev.map(s => s.id === updatedItem.id ? updatedItem : s));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// deleteSubscription
code = code.replace(
    /const deleteSubscription = useCallback\(async \(id: string\) => \{\n        try \{\n            \n            await deleteDoc\(doc\(db, 'users', getDeviceId\(\), 'subscriptions', id\.toString\(\)\)\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.DELETE, 'users\/subscriptions'\); \}\n    \}, \[\]\);/g,
    `const deleteSubscription = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteSubscription(user.id, id);
            setSubscriptions(prev => prev.filter(s => s.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// addScheduledTransaction
code = code.replace(
    /const addScheduledTransaction = useCallback\(async \(item: Omit<ScheduledTransaction, 'id'>\) => \{\n        const newItem = \{ \.\.\.item, id: generateId\(\) \};\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'scheduledTransactions', newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users\/scheduledTransactions'\); \}\n    \}, \[\]\);/g,
    `const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addScheduledTransaction(user.id, newItem);
            setScheduledTransactions(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`
);

// updateScheduledTransaction
code = code.replace(
    /const updateScheduledTransaction = useCallback\(\(updatedItem: ScheduledTransaction\) => \{\n        setScheduledTransactions\(prev => prev\.map\(item => item\.id === updatedItem\.id \? updatedItem : item\)\);\n    \}, \[\]\);/g,
    `const updateScheduledTransaction = useCallback(async (updatedItem: ScheduledTransaction) => {
        if (!user) return;
        try {
            await dbService.updateScheduledTransaction(user.id, updatedItem);
            setScheduledTransactions(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// deleteScheduledTransaction
code = code.replace(
    /const deleteScheduledTransaction = useCallback\(async \(id: string\) => \{\n        try \{\n            \n            await deleteDoc\(doc\(db, 'users', getDeviceId\(\), 'scheduledTransactions', id\.toString\(\)\)\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.DELETE, 'users\/scheduledTransactions'\); \}\n    \}, \[\]\);/g,
    `const deleteScheduledTransaction = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteScheduledTransaction(user.id, id);
            setScheduledTransactions(prev => prev.filter(s => s.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// addInvestment
code = code.replace(
    /const addInvestment = useCallback\(async \(item: Omit<Investment, 'id'>\) => \{\n        const newItem = \{ \.\.\.item, id: generateId\(\) \};\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'investments', newItem\.id\.toString\(\)\), newItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.CREATE, 'users\/investments'\); \}\n    \}, \[\]\);/g,
    `const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addInvestment(user.id, newItem);
            setInvestments(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`
);

// updateInvestment
code = code.replace(
    /const updateInvestment = useCallback\(async \(updatedItem: Investment\) => \{\n        try \{\n            \n            await setDoc\(doc\(db, 'users', getDeviceId\(\), 'investments', updatedItem\.id\.toString\(\)\), updatedItem\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.UPDATE, 'users\/investments'\); \}\n    \}, \[\]\);/g,
    `const updateInvestment = useCallback(async (updatedItem: Investment) => {
        if (!user) return;
        try {
            await dbService.updateInvestment(user.id, updatedItem);
            setInvestments(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        } catch(e) { console.error(e); }
    }, [user]);`
);

// deleteInvestment
code = code.replace(
    /const deleteInvestment = useCallback\(async \(id: string\) => \{\n        try \{\n            \n            await deleteDoc\(doc\(db, 'users', getDeviceId\(\), 'investments', id\.toString\(\)\)\);\n        \} catch\(e\) \{ handleFirestoreError\(e, OperationType\.DELETE, 'users\/investments'\); \}\n    \}, \[\]\);/g,
    `const deleteInvestment = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteInvestment(user.id, id);
            setInvestments(prev => prev.filter(i => i.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);`
);

fs.writeFileSync('App.tsx', code);
