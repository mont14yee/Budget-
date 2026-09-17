const fs = require('fs');
let code = fs.readFileSync('views/DashboardView.tsx', 'utf8');

if (!code.includes('netWorth?: number;')) {
    code = code.replace('assets: number;', 'assets: number;\n    netWorth?: number;');
}

code = code.replace(/const DashboardView: React\.FC<DashboardViewProps> = \(\{([^}]+)\}\) => \{/, (match, p1) => {
    if (!p1.includes('netWorth')) {
        return `const DashboardView: React.FC<DashboardViewProps> = ({${p1}, netWorth}) => {`;
    }
    return match;
});

// Add it to StatCards
const statCardSection = `<StatCard title={t('netAmount')} amount={netAmount} icon="fas fa-balance-scale" color="#2196f3" borderColor="border-blue-500" currencySettings={currencySettings} />`;
const replacementStatCard = `<StatCard title={t('netAmount')} amount={netAmount} icon="fas fa-money-bill-wave" color="#2196f3" borderColor="border-blue-500" currencySettings={currencySettings} />
                 {netWorth !== undefined && <StatCard title={t('netWorth') || 'Net Worth'} amount={netWorth} icon="fas fa-balance-scale" color="#9c27b0" borderColor="border-purple-500" currencySettings={currencySettings} />}`;

code = code.replace(statCardSection, replacementStatCard);

fs.writeFileSync('views/DashboardView.tsx', code);
