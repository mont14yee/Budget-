import { addMoney, subtractMoney, multiplyMoney, divideMoney } from './utils/money';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ViewType, Transaction, SavingsGoal, TransactionType, AllTransaction, UserProfile, FeatureType, Loan, LoanType, Repayment, ExtraContribution, Subscription, ScheduledTransaction, Investment, Frequency } from './types';
import { generateId, getDeviceId, INITIAL_INCOME, INITIAL_EXPENSES, INITIAL_SAVINGS_GOALS, getIncomeCategories, getAllExpenseCategories, getShoppingCategories, INITIAL_LOANS, INITIAL_SUBSCRIPTIONS, INITIAL_SCHEDULED_TRANSACTIONS, INITIAL_INVESTMENTS, parseLocalDate, formatLocalDate } from './constants';
import Header from './components/Header';
import FooterNav from './components/FooterNav';
import DashboardView from './views/DashboardView';
import IncomeView from './views/IncomeView';
import ExpensesView from './views/ExpensesView';
import SavingsView from './views/SavingsView';
import MoreView from './views/MoreView';
import Chatbot from './components/Chatbot';
import { useLanguage } from './contexts/LanguageContext';
import ReportsView from './views/ReportsView';
import CalculatorView from './views/CalculatorView';
import CurrencyConverter from './views/CurrencyConverterView';
import NutritionView from './components/NutritionView';
import SettingsAndAboutView from './views/SettingsAndAboutView';
import LoansView from './views/LoansView';
import SubscriptionsView from './views/SubscriptionsView';
import ActivityLogView from './views/ActivityLogView';
import ScheduledView from './views/ScheduledView';
import CalendarView from './views/CalendarView';
import InvestmentsView from './views/InvestmentsView';

import { useAuth } from './contexts/AuthContext';
import { dbService } from './services/supabaseService';
import AuthView from './views/AuthView';

const FullScreenContainer: React.FC<{
    title: string;
    icon: string;
    children: React.ReactNode;
    theme: 'light' | 'dark';
    animationStyle: React.CSSProperties;
    onClose: () => void;
}> = ({ title, icon, children, theme, animationStyle, onClose }) => (
    <div className={`fixed inset-0 z-[100] flex flex-col ${theme === 'dark' ? 'bg-[#0b0f19]' : 'bg-[#fcfdfd]'}`} style={animationStyle}>
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {theme === 'light' ? (
                <>
                    <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#7dd3fc]/30 blur-[100px]" />
                    <div className="absolute -bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-[#d8b4fe]/20 blur-[120px]" />
                </>
            ) : (
                <>
                    <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#0284c7]/15 blur-[120px]" />
                </>
            )}
        </div>
            
        <header className="flex-shrink-0 pt-12 pb-4 px-6 relative z-10 flex items-center justify-between no-print">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm" aria-label="Close">
                <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
                {title}
            </h2>
            <div className="w-10 h-10"></div>
        </header>
        <main className="flex-1 overflow-y-auto relative z-10 px-2 sm:px-4">
            {children}
        </main>
    </div>
);

const App: React.FC = () => {
    const { language, t, currencySettings } = useLanguage();
    const [activeView, setActiveView] = useState<ViewType>(ViewType.Dashboard);
    const [activeFeature, setActiveFeature] = useState<FeatureType | null>(null);
    const [featureOrigin, setFeatureOrigin] = useState<{x: number, y: number} | null>(null);
    
    
    const { user, isLoading: authLoading, signOut } = useAuth();
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [authReady, setAuthReady] = useState(false);

    const [income, setIncome] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Transaction[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);


    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [isChatbotOpen, setChatbotOpen] = useState(false);


    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            try {
                const inc = await dbService.getIncome(user.id);
                setIncome(inc);
                const exp = await dbService.getExpenses(user.id);
                setExpenses(exp);
                const goals = await dbService.getSavingsGoals(user.id);
                setSavingsGoals(goals);
                const lns = await dbService.getLoans(user.id);
                setLoans(lns);
                const subs = await dbService.getSubscriptions(user.id);
                setSubscriptions(subs);
                const scheds = await dbService.getScheduledTransactions(user.id);
                setScheduledTransactions(scheds);
                const invs = await dbService.getInvestments(user.id);
                setInvestments(invs);
            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setAuthReady(true);
            }
        };
        loadData();
    }, [user]);

    const setUserProfile = (profile: UserProfile) => {
        setUserProfileState(profile);
        localStorage.setItem('wallet_user_profile', JSON.stringify(profile));
    };
    const [incomeCategories, setIncomeCategories] = useState<string[]>(getIncomeCategories(language));
    const [allExpenseCategories, setAllExpenseCategories] = useState<string[]>(getAllExpenseCategories(language));
    const [shoppingCategories, setShoppingCategories] = useState<string[]>(getShoppingCategories(language));

    useEffect(() => {
        setIncomeCategories(getIncomeCategories(language));
        setAllExpenseCategories(getAllExpenseCategories(language));
        setShoppingCategories(getShoppingCategories(language));
    }, [language]);









    useEffect(() => {
        // Clear category filter when navigating away from transaction lists
        if (activeView !== ViewType.Expenses && activeView !== ViewType.Income) {
            setCategoryFilter(null);
        }
    }, [activeView]);


    const allTransactions: AllTransaction[] = useMemo(() => {
        const incomeWithType = income.map(t => ({ ...t, type: TransactionType.Income as const }));
        const expensesWithType = expenses.map(t => ({
          ...t,
          type: shoppingCategories.includes(t.category) ? TransactionType.Shopping : TransactionType.Expense,
        }));
        return [...incomeWithType, ...expensesWithType];
    }, [income, expenses, shoppingCategories]);
    
    const shoppingListForTargets = useMemo(() => 
        expenses.filter(t => shoppingCategories.includes(t.category))
    , [expenses, shoppingCategories]);

    const totalIncome = useMemo(() => income.reduce((sum, item) => addMoney(sum, item.amount), 0), [income]);
    const totalExpenses = useMemo(() => expenses.reduce((sum, item) => addMoney(sum, item.amount), 0), [expenses]);
    const netAmount = useMemo(() => subtractMoney(totalIncome, totalExpenses), [totalIncome, totalExpenses]);

    const totalAssetsLent = useMemo(() => loans.filter(l => l.type === LoanType.Lent).reduce((sum, item) => addMoney(sum, item.outstandingAmount), 0), [loans]);
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


    const allTransactionsForExport = useMemo(() => {
        return [
            ...income.map(tx => ({...tx, type: t('income')})),
            ...expenses.map(tx => ({...tx, type: t('expense')})),
        ].sort((a,b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
    }, [income, expenses, t]);
    
    const exportToCSV = () => {
        const data = allTransactionsForExport;
        const filename = 'all_transactions.csv';
        if (!data || data.length === 0) {
            alert(t('noDataToExport'));
            return;
        }

        const sanitizeCsvField = (field: string) => {
            if (/^[=+\-@]/.test(field)) {
                return `'${field}`;
            }
            return field;
        };
    
        const headers = [t('csvType'), t('csvDate'), t('csvName'), t('csvCategory'), `${t('csvAmount')} (${currencySettings.symbol})`];
        const csvRows = [
            headers.map(sanitizeCsvField).join(','), // header row
        ];
    
        for (const item of data) {
            const row = [
                `"${sanitizeCsvField(item.type).replace(/"/g, '""')}"`,
                item.date,
                `"${sanitizeCsvField(item.name).replace(/"/g, '""')}"`,
                `"${sanitizeCsvField(item.category).replace(/"/g, '""')}"`,
                item.amount.toFixed(2)
            ].join(',');
            csvRows.push(row);
        }
    
        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
    
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const addTransaction = useCallback(async (type: TransactionType, item: Omit<Transaction, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.date || isNaN(new Date(item.date).getTime())) return;
        
        const newItem = { ...item, id: generateId() };
        try {
            if (type === TransactionType.Income) {
                await dbService.addIncome(user.id, newItem);
                setIncome(prev => [...prev, newItem]);
            } else {
                await dbService.addExpense(user.id, newItem);
                setExpenses(prev => [...prev, newItem]);
            }
        } catch(e) { console.error(e); }
    }, [user]);

    const deleteTransaction = useCallback(async (type: TransactionType, id: string) => {
        if (!user) return;
        try {
            if (type === TransactionType.Income) {
                await dbService.deleteIncome(user.id, id);
                setIncome(prev => prev.filter(i => i.id !== id));
            } else {
                await dbService.deleteExpense(user.id, id);
                setExpenses(prev => prev.filter(i => i.id !== id));
            }
        } catch(e) { console.error(e); }
    }, [user]);

    const addSavingsGoal = useCallback(async (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        if (!user) return;
        if (isNaN(item.targetAmount) || item.targetAmount <= 0) return;
        if (isNaN(item.startingBalance) || item.startingBalance < 0) return;
        if (isNaN(item.monthlyContribution) || item.monthlyContribution < 0) return;
        if (isNaN(item.interestRate) || item.interestRate < 0) return;
        if (!item.deadline || isNaN(new Date(item.deadline).getTime())) return;

        const newItem = { ...item, id: generateId(), extraContributions: [] };
        try {
            await dbService.addSavingsGoal(user.id, newItem);
            setSavingsGoals(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);

    const deleteSavingsGoal = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteSavingsGoal(user.id, id);
            setSavingsGoals(prev => prev.filter(g => g.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);
    
    const addExtraContribution = useCallback(async (goalId: string, contribution: Omit<ExtraContribution, 'id'>) => {
        if (!user) return;
        if (isNaN(contribution.amount) || contribution.amount <= 0) return;
        if (!contribution.date || isNaN(new Date(contribution.date).getTime())) return;
        try {
            const goal = savingsGoals.find(g => g.id === goalId);
            if (!goal) return;
            const updated = {
                ...goal,
                startingBalance: addMoney(goal.startingBalance, contribution.amount),
                extraContributions: [{ ...contribution, id: generateId() }, ...(goal.extraContributions || [])]
            };
            await dbService.updateSavingsGoal(user.id, updated);
            setSavingsGoals(prev => prev.map(g => g.id === goalId ? updated : g));
        } catch(e) { console.error(e); }
    }, [user, savingsGoals]);

    const addIncomeCategory = useCallback((category: string) => {
        if (!incomeCategories.includes(category)) {
            setIncomeCategories(prev => [...prev, category]);
        }
    }, [incomeCategories]);

    const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        if (!user) return;
        if (isNaN(item.totalAmount) || item.totalAmount <= 0) return;
        if (isNaN(item.interestRate) || item.interestRate < 0) return;
        if (!item.date || isNaN(new Date(item.date).getTime())) return;
        if (!item.dueDate || isNaN(new Date(item.dueDate).getTime())) return;
        
        const newItem: Loan = { 
            ...item, 
            id: generateId(), 
            repayments: [], 
            outstandingAmount: item.totalAmount 
        };
        try {
            await dbService.addLoan(user.id, newItem);
            setLoans(prev => [...prev, newItem]);
            
            if (item.type === LoanType.Lent) {
                addTransaction(TransactionType.Expense, {
                    name: `${t('loanTo') || 'Loan to'} ${item.person}`,
                    amount: item.totalAmount,
                    date: item.date,
                    category: 'Loan Disbursement',
                });
            } else {
                addTransaction(TransactionType.Income, {
                    name: `${t('loanFrom') || 'Loan from'} ${item.person}`,
                    amount: item.totalAmount,
                    date: item.date,
                    category: 'Loan Received',
                });
            }
        } catch(e) { console.error(e); }
    }, [user, addTransaction, t]);

    const deleteLoan = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteLoan(user.id, id);
            setLoans(prev => prev.filter(l => l.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);

    const addRepaymentToLoan = useCallback(async (loanId: string, repayment: Omit<Repayment, 'id'>) => {
        if (!user) return;
        if (isNaN(repayment.amount) || repayment.amount <= 0) return;
        if (!repayment.date || isNaN(new Date(repayment.date).getTime())) return;
        try {
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return;
            const newRepayment = { ...repayment, id: generateId() };
            const updated = {
                ...loan,
                outstandingAmount: Math.max(0, subtractMoney(loan.outstandingAmount, repayment.amount)),
                repayments: [newRepayment, ...(loan.repayments || [])]
            };
            await dbService.updateLoan(user.id, updated);
            setLoans(prev => prev.map(l => l.id === loanId ? updated : l));
            
            if (loan.type === LoanType.Lent) {
                addTransaction(TransactionType.Income, {
                    name: `${t('repaymentFrom')} ${loan.person}`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Repayment',
                });
            } else {
                addTransaction(TransactionType.Expense, {
                    name: `${t('paymentTo')} ${loan.person}`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Payment',
                });
            }
        } catch(e) { console.error(e); }
    }, [user, loans, addTransaction, t]);

    const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.renewalDate || isNaN(new Date(item.renewalDate).getTime())) return;
        if (!Object.values(Frequency).includes(item.frequency as Frequency)) return;
        
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addSubscription(user.id, newItem);
            setSubscriptions(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);

    const updateSubscription = useCallback(async (updatedItem: Subscription) => {
        if (!user) return;
        try {
            await dbService.updateSubscription(user.id, updatedItem);
            setSubscriptions(prev => prev.map(s => s.id === updatedItem.id ? updatedItem : s));
        } catch(e) { console.error(e); }
    }, [user]);

    const deleteSubscription = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteSubscription(user.id, id);
            setSubscriptions(prev => prev.filter(s => s.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);

    const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        if (!user) return;
        if (isNaN(item.amount) || item.amount <= 0) return;
        if (!item.startDate || isNaN(new Date(item.startDate).getTime())) return;
        if (!Object.values(Frequency).includes(item.frequency as Frequency)) return;
        
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addScheduledTransaction(user.id, newItem);
            setScheduledTransactions(prev => [...prev, newItem]);
        } catch(e) { console.error(e); }
    }, [user]);

    const updateScheduledTransaction = useCallback(async (updatedItem: ScheduledTransaction) => {
        if (!user) return;
        try {
            await dbService.updateScheduledTransaction(user.id, updatedItem);
            setScheduledTransactions(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        } catch(e) { console.error(e); }
    }, [user]);

    const deleteScheduledTransaction = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteScheduledTransaction(user.id, id);
            setScheduledTransactions(prev => prev.filter(s => s.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);
    
    const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        if (!user) return;
        if (isNaN(item.quantity) || item.quantity <= 0) return;
        if (isNaN(item.purchasePrice) || item.purchasePrice < 0) return;
        if (isNaN(item.currentPrice) || item.currentPrice < 0) return;
        if (!item.purchaseDate || isNaN(new Date(item.purchaseDate).getTime())) return;
        
        const newItem = { ...item, id: generateId() };
        try {
            await dbService.addInvestment(user.id, newItem);
            setInvestments(prev => [...prev, newItem]);
            
            // Record the investment purchase as an expense to ensure cash flow accuracy
            const costBasis = multiplyMoney(item.purchasePrice, item.quantity);
            addTransaction(TransactionType.Expense, {
                name: `${t('buy')} ${item.name}`,
                amount: costBasis,
                date: item.purchaseDate,
                category: t('investmentPurchaseCategory') || 'Investment Purchase',
            });
        } catch(e) { console.error(e); }
    }, [user, addTransaction, t]);

    const updateInvestment = useCallback(async (updatedItem: Investment) => {
        if (!user) return;
        if (isNaN(updatedItem.quantity) || updatedItem.quantity < 0) return;
        if (isNaN(updatedItem.currentPrice) || updatedItem.currentPrice < 0) return;
        if (isNaN(updatedItem.purchasePrice) || updatedItem.purchasePrice < 0) return;
        try {
            await dbService.updateInvestment(user.id, updatedItem);
            setInvestments(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        } catch(e) { console.error(e); }
    }, [user]);

    const sellInvestment = useCallback(async (id: string) => {
        if (!user) return;
        const investmentToSell = investments.find(inv => inv.id === id);
        if (investmentToSell) {
            const costBasis = multiplyMoney(investmentToSell.purchasePrice, investmentToSell.quantity);
            const saleProceeds = multiplyMoney(investmentToSell.currentPrice, investmentToSell.quantity);
            const realizedGain = subtractMoney(saleProceeds, costBasis);
            
            // Record the ENTIRE sale proceeds as cash received (Income)
            // The gain/loss is properly distinguished in the transaction name/notes
            const gainLossText = realizedGain >= 0 ? `+${realizedGain}` : `${realizedGain}`;
            addTransaction(TransactionType.Income, {
                name: `${t('sell')} ${investmentToSell.name} (Cost: ${costBasis}, Gain: ${gainLossText})`,
                amount: saleProceeds,
                date: formatLocalDate(new Date()),
                category: t('investmentSaleCategory') || 'Investment Sale',
            });
            
            try {
                await dbService.deleteInvestment(user.id, id);
                setInvestments(prev => prev.filter(i => i.id !== id));
            } catch(e) { console.error(e); }
        }
    }, [user, investments, addTransaction, t]);

    const deleteInvestment = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await dbService.deleteInvestment(user.id, id);
            setInvestments(prev => prev.filter(i => i.id !== id));
        } catch(e) { console.error(e); }
    }, [user]);

    const renderView = () => {
        const filteredIncome = categoryFilter ? income.filter(i => i.category === categoryFilter) : income;
        const filteredExpenses = categoryFilter ? expenses.filter(e => e.category === categoryFilter) : expenses;

        switch (activeView) {
            case ViewType.Dashboard:
                return <DashboardView 
                            theme={theme}
                            income={totalIncome} 
                            expenses={totalExpenses} 
                            netAmount={netAmount} 
                            allIncome={income}
                            allExpenses={expenses} 
                            setActiveView={setActiveView}
                            setCategoryFilter={setCategoryFilter}
                            exportToCSV={exportToCSV}
                            assets={totalAssets} 
                            netWorth={netWorth}
                            liabilities={totalLiabilities}
                        />;
            case ViewType.Income:
                return <IncomeView 
                            items={filteredIncome} 
                            allItems={income}
                            total={totalIncome} 
                            addIncome={(item: Omit<Transaction, 'id'>) => addTransaction(TransactionType.Income, item)} 
                            deleteIncome={(id: string) => deleteTransaction(TransactionType.Income, id)}
                            categoryFilter={categoryFilter}
                            onClearFilter={() => setCategoryFilter(null)}
                            categories={incomeCategories}
                            addCategory={addIncomeCategory}
                            theme={theme}
                        />;
            case ViewType.Expenses:
                return <ExpensesView 
                            items={filteredExpenses} 
                            allItems={expenses}
                            total={totalExpenses} 
                            addExpense={(item: Omit<Transaction, 'id'>) => addTransaction(TransactionType.Expense, item)} 
                            deleteExpense={(id: string) => deleteTransaction(TransactionType.Expense, id)}
                            categoryFilter={categoryFilter}
                            onClearFilter={() => setCategoryFilter(null)}
                            expenseCategories={allExpenseCategories}
                            theme={theme}
                        />;
            case ViewType.More:
                return <MoreView onSelectFeature={(feature: FeatureType, origin?: { x: number; y: number; }) => {
                    setFeatureOrigin(origin || null);
                    setActiveFeature(feature);
                }} />;
            case ViewType.Investments:
                 return <div className="min-h-screen pt-4 pb-24"><InvestmentsView
                        investments={investments}
                        addInvestment={addInvestment}
                        updateInvestment={updateInvestment}
                        sellInvestment={sellInvestment}
                        deleteInvestment={deleteInvestment}
                        income={income}
                        expenses={expenses}
                    /></div>;
            case ViewType.Settings:
                 return <div className="min-h-screen pt-4"><SettingsAndAboutView
                        theme={theme}
                        setTheme={setTheme}
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                    /></div>;
            default:
                return <DashboardView 
                            theme={theme}
                            income={totalIncome} 
                            expenses={totalExpenses} 
                            netAmount={netAmount} 
                            allIncome={income}
                            allExpenses={expenses} 
                            setActiveView={setActiveView}
                            setCategoryFilter={setCategoryFilter}
                            exportToCSV={exportToCSV}
                            assets={totalAssets} 
                            netWorth={netWorth}
                            liabilities={totalLiabilities}
                        />;
        }
    };

    const renderFeatureView = () => {
        if (!activeFeature) return null;
    
        const animationStyle: React.CSSProperties = featureOrigin ? {
             '--origin-x': `${featureOrigin.x}px`,
             '--origin-y': `${featureOrigin.y}px`,
             animation: 'clipReveal 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards'
        } as React.CSSProperties : {
             animation: 'fadeIn 0.2s ease-out forwards'
        };

    
        switch (activeFeature) {
            case FeatureType.ActivityLog:
                return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('activityLog')} icon="fas fa-book-open">
                    <ActivityLogView
                        transactions={allTransactions}
                        addTransaction={addTransaction}
                        incomeCategories={incomeCategories}
                        expenseCategories={allExpenseCategories}
                    />
                </FullScreenContainer>;
            case FeatureType.Savings:
                return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('savings')} icon="fas fa-piggy-bank">
                    <SavingsView 
                        items={savingsGoals} 
                        addSavingsGoal={addSavingsGoal} 
                        deleteSavingsGoal={deleteSavingsGoal}
                        addExtraContribution={addExtraContribution}
                        netBalance={netAmount}
                        theme={theme}
                    />
                </FullScreenContainer>;
            case FeatureType.Subscriptions:
                return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('subscriptions')} icon="fas fa-sync-alt">
                    <SubscriptionsView
                        subscriptions={subscriptions}
                        addSubscription={addSubscription}
                        updateSubscription={updateSubscription}
                        deleteSubscription={deleteSubscription}
                        theme={theme}
                        expenseCategories={allExpenseCategories}
                        incomeCategories={incomeCategories}
                    />
                </FullScreenContainer>;
            case FeatureType.Scheduled:
                 return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('scheduledTransactions')} icon="fas fa-calendar-alt">
                    <ScheduledView
                        scheduled={scheduledTransactions}
                        addScheduled={addScheduledTransaction}
                        updateScheduled={updateScheduledTransaction}
                        deleteScheduled={deleteScheduledTransaction}
                        logTransaction={addTransaction}
                        incomeCategories={incomeCategories}
                        expenseCategories={allExpenseCategories}
                    />
                 </FullScreenContainer>;
            case FeatureType.Calendar:
                return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('calendar')} icon="fas fa-calendar-day">
                    <CalendarView
                        scheduled={scheduledTransactions}
                        loans={loans}
                        subscriptions={subscriptions}
                    />
                </FullScreenContainer>;
            case FeatureType.Calculator:
                return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('calculator')} icon="fas fa-calculator">
                    <div className="p-4 sm:p-6 h-full"><CalculatorView /></div>
                </FullScreenContainer>;
            case FeatureType.Converter:
                 return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('converter')} icon="fas fa-exchange-alt">
                    <div className="p-4 sm:p-6 h-full"><CurrencyConverter /></div>
                 </FullScreenContainer>;
            case FeatureType.Reports:
                 return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('reports')} icon="fas fa-file-invoice-dollar">
                    <ReportsView
                        userProfile={userProfile}
                        allTransactions={allTransactions}
                        incomeCategories={incomeCategories}
                        expenseCategories={allExpenseCategories}
                        shoppingCategories={shoppingCategories}
                    />
                 </FullScreenContainer>;
            case FeatureType.Loans:
                 return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('loans')} icon="fas fa-hand-holding-usd">
                    <LoansView
                        loans={loans}
                        addLoan={addLoan}
                        deleteLoan={deleteLoan}
                        addRepayment={addRepaymentToLoan}
                    />
                 </FullScreenContainer>;
            case FeatureType.Nutrition:
                 return <FullScreenContainer theme={theme} animationStyle={animationStyle} onClose={() => setActiveFeature(null)} title={t('nutrition')} icon="fas fa-heartbeat">
                    <NutritionView shoppingList={shoppingListForTargets} />
                 </FullScreenContainer>;
            default:
                return null;
        }
    };

    if (authLoading) return <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}`}>
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'light' ? (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
            </>
        ) : (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
            </>
        )}
    </div>
    <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse tracking-wide uppercase text-xs">Loading Secure Environment</p>
    </div>
</div>
;
    if (!user) return <AuthView theme={theme} />;
    if (!authReady) return <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}`}>
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'light' ? (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
            </>
        ) : (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
            </>
        )}
    </div>
    <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse tracking-wide uppercase text-xs">Decrypting Financial Data</p>
    </div>
</div>
;

    if (!userProfile) {
        return <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}`}>
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'light' ? (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
            </>
        ) : (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
            </>
        )}
    </div>
    <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse tracking-wide uppercase text-xs">Preparing Profile</p>
    </div>
</div>
;
    }

    return (
        <div className={`min-h-screen pb-24 px-0 relative font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] text-gray-100' : 'bg-[#fcfdfd] text-gray-900'}`}>
            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {theme === 'light' ? (
                    <>
                        <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
                        <div className="absolute -bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-[#d8b4fe]/30 blur-[120px]" />
                        <div className="absolute top-[5%] right-[0%] w-[40%] h-[30%] rounded-full bg-[#a5f3fc]/20 blur-[90px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
                        <div className="absolute -bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-[#a21caf]/15 blur-[120px]" />
                    </>
                )}
            </div>

            <div className="w-full relative z-10 max-w-xl mx-auto shadow-2xl shadow-gray-200/50 dark:shadow-black/50 min-h-screen bg-white/40 dark:bg-black/20 backdrop-blur-3xl overflow-hidden sm:rounded-3xl sm:my-4 sm:border sm:border-white/20 dark:sm:border-white/5">
                <Header 
                    activeView={activeView} 
                    userProfile={userProfile}
                    setActiveView={setActiveView}
                    onSelectFeature={(feature: FeatureType, origin?: { x: number; y: number; }) => {
                        setFeatureOrigin(origin || null);
                        setActiveFeature(feature);
                    }}
                />
                <main className="px-2">
                    {renderView()}
                </main>
            </div>
            <FooterNav activeView={activeView} setActiveView={setActiveView} />
            <button
                onClick={() => setChatbotOpen(true)}
                className="fixed bottom-24 right-5 sm:bottom-28 sm:right-12 w-14 h-14 bg-gradient-to-tr from-purple-500 to-cyan-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-40 flex items-center justify-center border border-white/20"
                aria-label={t('financialAssistant')}
            >
                <i className="fas fa-robot fa-lg"></i>
            </button>
            <Chatbot 
                isOpen={isChatbotOpen} 
                onClose={() => setChatbotOpen(false)} 
            />
            {renderFeatureView()}
        </div>
    );
};

export default App;