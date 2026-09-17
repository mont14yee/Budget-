const fs = require('fs');
let code = fs.readFileSync('views/DashboardView.tsx', 'utf8');

const oldStatCard = `const StatCard: React.FC<{ title: string; amount: number; icon: string; color: string; borderColor: string; currencySettings: any }> = ({ title, amount, icon, color, borderColor, currencySettings }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center justify-between">
            <div>
                 <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{title}</p>
                 <h3 className={\`text-3xl font-semibold mt-2 tracking-tight \${amount >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-500'}\`}>
                    {formatCurrency(amount, currencySettings)}
                </h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/40 dark:border-gray-600/30" style={{ backgroundColor: color + '15', color: color }}>
                <i className={icon}></i>
            </div>
        </div>
    </div>
);`;

const newStatCard = `const StatCard: React.FC<{ title: string; amount: number; icon: string; color: string; borderColor: string; currencySettings: any }> = ({ title, amount, icon, color, borderColor, currencySettings }) => (
    <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150" style={{ backgroundColor: color }}></div>
        <div className="relative z-10 flex items-center justify-between">
            <div>
                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">{title}</p>
                 <h3 className={\`text-3xl font-semibold tracking-tight \${amount >= 0 ? 'text-gray-900 dark:text-gray-50' : 'text-red-500 dark:text-red-400'}\`}>
                    {formatCurrency(amount, currencySettings)}
                </h3>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100/50 dark:border-gray-800/50 transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: color + '10', color: color }}>
                <i className={icon}></i>
            </div>
        </div>
    </div>
);`;

code = code.replace(oldStatCard, newStatCard);

// Also make dashboard buttons premium
code = code.replace(/bg-blue-600 hover:bg-blue-700/g, 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-gray-900');
code = code.replace(/bg-teal-600 hover:bg-teal-700/g, 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-gray-900');
code = code.replace(/text-white/g, 'text-white dark:text-gray-900'); // Ensure it toggles properly for buttons

fs.writeFileSync('views/DashboardView.tsx', code);
