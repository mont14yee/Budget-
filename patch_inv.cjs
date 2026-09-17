const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetAddInv = `const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        if (!user) return;
        const newItem = { ...item, id: generateId() };`;
        
const replaceAddInv = `const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        if (!user) return;
        if (isNaN(item.quantity) || item.quantity <= 0) return;
        if (isNaN(item.purchasePrice) || item.purchasePrice < 0) return;
        if (isNaN(item.currentPrice) || item.currentPrice < 0) return;
        if (!item.purchaseDate || isNaN(new Date(item.purchaseDate).getTime())) return;
        
        const newItem = { ...item, id: generateId() };`;

code = code.replace(targetAddInv, replaceAddInv);
fs.writeFileSync('App.tsx', code);
