const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const freqCheckSub = `if (!Object.values(Frequency).includes(item.frequency as Frequency)) return;`;
const freqCheckSched = `if (!Object.values(Frequency).includes(item.frequency as Frequency)) return;`;

const targetAddSub = `const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.renewalDate || isNaN(new Date(item.renewalDate).getTime())) return;`;

const replaceAddSub = targetAddSub + `\n        ${freqCheckSub}`;

code = code.replace(targetAddSub, replaceAddSub);

const targetAddSched = `const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.startDate || isNaN(new Date(item.startDate).getTime())) return;`;

const replaceAddSched = targetAddSched + `\n        ${freqCheckSched}`;

code = code.replace(targetAddSched, replaceAddSched);

fs.writeFileSync('App.tsx', code);
