const fs = require('fs');
let code = fs.readFileSync('components/TransactionView.tsx', 'utf8');

const originalRender = `{displayedItems.length > 0 ? displayedItems.map(item => (`;
const replacementRender = `{displayedItems.length > 0 ? displayedItems.map(item => (`;

const emptyState = `
                    {displayedItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                <i className="fas fa-folder-open text-2xl text-gray-400 dark:text-gray-500"></i>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{t('noData') || 'No transactions yet'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
                                Add your first transaction to start tracking your finances.
                            </p>
                        </div>
                    )}
`;

if (!code.includes('No transactions yet')) {
    code = code.replace(originalRender, emptyState + originalRender);
    fs.writeFileSync('components/TransactionView.tsx', code);
}

