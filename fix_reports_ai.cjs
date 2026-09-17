const fs = require('fs');

let code = fs.readFileSync('views/ReportsView.tsx', 'utf8');

const newGen = `
    const generateAndSetAiSummary = async (summary: ReportSummary, report: AllTransaction[]) => {
        setIsGeneratingSummary(true);
        setAiSummary(null);
        try {
            const expenseCategories = report
                .filter(t => t.type !== TransactionType.Income)
                .reduce((acc, t) => {
                    acc[t.category] = addMoney(acc[t.category] || 0, t.amount);
                    return acc;
                }, {} as {[key: string]: number});
            
            const top5Expenses = Object.entries(expenseCategories)
                .sort(([,a],[,b]) => b-a)
                .slice(0, 5)
                .map(([name, amount]) => \`\${name}: \${formatCurrency(amount, currencySettings)}\`)
                .join('\\n');

            const prompt = \`Based on the following financial data from a user's report, provide a concise summary and one or two actionable tips. 
The currency is \${currencySettings.symbol}. The user's language is \${language === 'am' ? 'Amharic' : 'English'}. Respond in the user's language.
- Time Period: \${startDate} to \${endDate}
- Total Income: \${formatCurrency(summary.totalIncome, currencySettings)}
- Total Expenses: \${formatCurrency(summary.totalOutgoings, currencySettings)}
- Net Balance: \${formatCurrency(summary.netBalance, currencySettings)}
- Top 5 Expense Categories:
\${top5Expenses}
Keep the summary friendly, insightful, and brief (around 3-4 sentences). The tips should be practical and relevant to the data provided. For example, if food spending is high, suggest meal planning. If the net balance is negative, suggest reviewing specific spending categories. Do not use markdown formatting like headers or lists. Just provide a single paragraph of text.\`;

            let token = 'dummy-token';
            const stored = localStorage.getItem('wallet_user');
            if (stored) {
               token = JSON.parse(stored).id;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('/api/report-summary', {
                signal: controller.signal,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${token}\`
                },
                method: 'POST',
                body: JSON.stringify({ prompt }),
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            setAiSummary(data.text);
        } catch (error: any) {
            console.error('Failed to generate summary:', error);
            setAiSummary(t('aiSummaryError') || 'Failed to generate summary. Please try again.');
        } finally {
            setIsGeneratingSummary(false);
        }
    };
`;

code = code.replace(/const generateAndSetAiSummary = async \(summary: ReportSummary, report: AllTransaction\[\]\) => \{[\s\S]*?finally \{\s*setIsGeneratingSummary\(false\);\s*\}\s*\};/m, newGen);

fs.writeFileSync('views/ReportsView.tsx', code);
