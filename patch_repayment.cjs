const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = code.substring(
    code.indexOf('const addRepaymentToLoan = useCallback'),
    code.indexOf('}, [loans, addTransaction, t]);') + '}, [loans, addTransaction, t]);'.length
);

const replacement = `const addRepaymentToLoan = useCallback(async (loanId: string, repayment: Omit<Repayment, 'id'>) => {
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
                    name: \`\${t('paymentTo')} \${loan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Payment',
                });
            }
        } catch(e) { console.error(e); }
    }, [user, loans, addTransaction, t]);`;

code = code.replace(target, replacement);
fs.writeFileSync('App.tsx', code);
