const fs = require('fs');
let code = fs.readFileSync('views/DashboardView.tsx', 'utf8');

const original = `<div className="mb-8 max-w-sm">
                <StatCard title={t('netAmount')} amount={netAmount} icon="fas fa-money-bill-wave" color="#2196f3" borderColor="border-blue-500" currencySettings={currencySettings} />
                 {netWorth !== undefined && <StatCard title={t('netWorth') || 'Net Worth'} amount={netWorth} icon="fas fa-balance-scale" color="#9c27b0" borderColor="border-purple-500" currencySettings={currencySettings} />}
            </div>`;

const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard title={t('netAmount')} amount={netAmount} icon="fas fa-money-bill-wave" color="#2196f3" borderColor="border-blue-500" currencySettings={currencySettings} />
                 {netWorth !== undefined && <StatCard title={t('netWorth') || 'Net Worth'} amount={netWorth} icon="fas fa-balance-scale" color="#9c27b0" borderColor="border-purple-500" currencySettings={currencySettings} />}
            </div>`;

code = code.replace(original, replacement);
fs.writeFileSync('views/DashboardView.tsx', code);
