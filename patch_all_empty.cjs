const fs = require('fs');

const emptyMarkup = (title, message, icon) => (
    '\n<div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm my-4">' +
        '<div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">' +
            '<i className="fas ' + icon + ' text-2xl text-gray-400 dark:text-gray-500"></i>' +
        '</div>' +
        '<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">' + title + '</h3>' +
        '<p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] leading-relaxed">' + message + '</p>' +
    '</div>\n'
);

// 1. TransactionView
let tCode = fs.readFileSync('components/TransactionView.tsx', 'utf8');
const tEmptyPattern = /\{displayedItems\.length === 0 && \([\s\S]*?<\/div>[\s]*\)\}/;
if (tCode.match(tEmptyPattern)) {
    tCode = tCode.replace(tEmptyPattern, '{displayedItems.length === 0 && (' + emptyMarkup("{t('noData') || 'No records found'}", "Add your first entry to start tracking.", "fa-folder-open") + ')}');
    fs.writeFileSync('components/TransactionView.tsx', tCode);
}

// 2. LoansView
let lCode = fs.readFileSync('views/LoansView.tsx', 'utf8');
if (lCode.includes('displayedLoans.length > 0 ? (')) {
    lCode = lCode.replace(/<p className="text-gray-500 dark:text-gray-400">\{t\('noData'\)\}<\/p>/, emptyMarkup("{t('noData') || 'No loans found'}", "You have no active loans in this category.", "fa-handshake"));
    fs.writeFileSync('views/LoansView.tsx', lCode);
}

// 3. SavingsView
let sCode = fs.readFileSync('views/SavingsView.tsx', 'utf8');
if (sCode.includes('<p className="text-gray-500 dark:text-gray-400">{t(\'noData\')}</p>')) {
    sCode = sCode.replace(/<p className="text-gray-500 dark:text-gray-400">\{t\('noData'\)\}<\/p>/, emptyMarkup("{t('noData') || 'No savings goals'}", "Create a savings goal to track your progress.", "fa-piggy-bank"));
    fs.writeFileSync('views/SavingsView.tsx', sCode);
}

// 4. ScheduledView
let scCode = fs.readFileSync('views/ScheduledView.tsx', 'utf8');
if (scCode.includes('<p className="text-gray-500 dark:text-gray-400">{t(\'noData\')}</p>')) {
    scCode = scCode.replace(/<p className="text-gray-500 dark:text-gray-400">\{t\('noData'\)\}<\/p>/, emptyMarkup("{t('noData') || 'No scheduled transactions'}", "Set up recurring transactions to automate your budget.", "fa-calendar-check"));
    fs.writeFileSync('views/ScheduledView.tsx', scCode);
}

// 5. SubscriptionsView
let subCode = fs.readFileSync('views/SubscriptionsView.tsx', 'utf8');
if (subCode.includes('<p className="text-gray-500 dark:text-gray-400">{t(\'noData\')}</p>')) {
    subCode = subCode.replace(/<p className="text-gray-500 dark:text-gray-400">\{t\('noData'\)\}<\/p>/, emptyMarkup("{t('noData') || 'No active subscriptions'}", "Add your subscriptions to see how much they cost.", "fa-sync"));
    fs.writeFileSync('views/SubscriptionsView.tsx', subCode);
}

// 6. InvestmentsView
let invCode = fs.readFileSync('views/InvestmentsView.tsx', 'utf8');
if (invCode.includes('<div className="text-center py-16">')) {
    invCode = invCode.replace(/<div className="text-center py-16">[\s\S]*?<\/div>/, emptyMarkup("{t('noInvestments') || 'No investments'}", "Add an investment to track its performance over time.", "fa-seedling"));
    fs.writeFileSync('views/InvestmentsView.tsx', invCode);
}

