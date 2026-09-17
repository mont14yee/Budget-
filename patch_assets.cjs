const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const replacement = `    const totalAssetsLent = useMemo(() => loans.filter(l => l.type === LoanType.Lent).reduce((sum, item) => addMoney(sum, item.outstandingAmount), 0), [loans]);
    const totalLiabilitiesBorrowed = useMemo(() => loans.filter(l => l.type === LoanType.Borrowed).reduce((sum, item) => addMoney(sum, item.outstandingAmount), 0), [loans]);
    const investmentsValue = useMemo(() => investments.reduce((sum, inv) => addMoney(sum, multiplyMoney(inv.currentPrice, inv.quantity)), 0), [investments]);
    
    // Net Worth Calculation
    const totalAssets = useMemo(() => {
        // Cash Balance + Loans Lent + Investments Value
        const cashBalance = Math.max(0, netAmount); // Only count positive cash as asset
        return addMoney(cashBalance, totalAssetsLent, investmentsValue);
    }, [netAmount, totalAssetsLent, investmentsValue]);

    const totalLiabilities = useMemo(() => {
        const negativeCash = netAmount < 0 ? Math.abs(netAmount) : 0;
        return addMoney(totalLiabilitiesBorrowed, negativeCash);
    }, [totalLiabilitiesBorrowed, netAmount]);
    
    const netWorth = useMemo(() => subtractMoney(totalAssets, totalLiabilities), [totalAssets, totalLiabilities]);
`;

code = code.replace(/    const totalAssetsLent = useMemo\([^;]+;\n    const totalLiabilitiesBorrowed = useMemo\([^;]+;\n/, replacement);

code = code.replace(/assets={totalAssetsLent}/g, "assets={totalAssets} \n                            netWorth={netWorth}");
code = code.replace(/liabilities={totalLiabilitiesBorrowed}/g, "liabilities={totalLiabilities}");

if (!code.includes('multiplyMoney')) {
    code = code.replace('subtractMoney }', 'subtractMoney, multiplyMoney }');
}

fs.writeFileSync('App.tsx', code);
