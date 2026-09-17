const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const oldHeader = `<header className="flex-shrink-0 pt-12 pb-4 px-6 relative z-10 flex items-center justify-between no-print">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" aria-label="Close">
                <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {title}
            </h2>
            <div className="w-10 h-10"></div>
        </header>`;

const newHeader = `<header className="flex-shrink-0 pt-12 pb-4 px-6 relative z-10 flex items-center justify-between no-print">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm" aria-label="Close">
                <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
                {title}
            </h2>
            <div className="w-10 h-10"></div>
        </header>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('App.tsx', code);
