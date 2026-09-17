const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetAddInvestment = `const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addInvestment(user.id, newItem);
            setInvestments(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);`;

const replacementAddInvestment = `const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addInvestment(user.id, newItem);
            setInvestments(prev => [...prev, newItem]);
            
            // Record the investment purchase as an expense to ensure cash flow accuracy
            const costBasis = multiplyMoney(item.purchasePrice, item.quantity);
            addTransaction(TransactionType.Expense, {
                name: \`\${t('buy')} \${item.name}\`,
                amount: costBasis,
                date: item.purchaseDate,
                category: t('investmentPurchaseCategory') || 'Investment Purchase',
            });
        } catch(e) { console.error(e); }
    }, [user, addTransaction, t]);`;

code = code.replace(targetAddInvestment, replacementAddInvestment);

const targetSellInvestment = `const sellInvestment = useCallback(async (id: string) => {
        if (!user) return;
        const investmentToSell = investments.find(inv => inv.id === id);
        if (investmentToSell) {
            const gain = multiplyMoney(subtractMoney(investmentToSell.currentPrice, investmentToSell.purchasePrice), investmentToSell.quantity);
            if (gain > 0) {
                addTransaction(TransactionType.Income, {
                    name: \`\${t('sell')} \${investmentToSell.name}\`,
                    amount: gain,
                    date: new Date().toISOString().split('T')[0],
                    category: t('investmentGainsCategory'),
                });
            }
            try {
                await dbService.deleteInvestment(user.id, id);
                setInvestments(prev => prev.filter(i => i.id !== id));
            } catch(e) { console.error(e); }
        }
    }, [user, investments, addTransaction, t]);`;

const replacementSellInvestment = `const sellInvestment = useCallback(async (id: string) => {
        if (!user) return;
        const investmentToSell = investments.find(inv => inv.id === id);
        if (investmentToSell) {
            const costBasis = multiplyMoney(investmentToSell.purchasePrice, investmentToSell.quantity);
            const saleProceeds = multiplyMoney(investmentToSell.currentPrice, investmentToSell.quantity);
            const realizedGain = subtractMoney(saleProceeds, costBasis);
            
            // Record the ENTIRE sale proceeds as cash received (Income)
            // The gain/loss is properly distinguished in the transaction name/notes
            const gainLossText = realizedGain >= 0 ? \`+\${realizedGain}\` : \`\${realizedGain}\`;
            addTransaction(TransactionType.Income, {
                name: \`\${t('sell')} \${investmentToSell.name} (Cost: \${costBasis}, Gain: \${gainLossText})\`,
                amount: saleProceeds,
                date: new Date().toISOString().split('T')[0],
                category: t('investmentSaleCategory') || 'Investment Sale',
            });
            
            try {
                await dbService.deleteInvestment(user.id, id);
                setInvestments(prev => prev.filter(i => i.id !== id));
            } catch(e) { console.error(e); }
        }
    }, [user, investments, addTransaction, t]);`;

code = code.replace(targetSellInvestment, replacementSellInvestment);

fs.writeFileSync('App.tsx', code);
