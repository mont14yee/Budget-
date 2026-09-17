const fs = require('fs');

let code = fs.readFileSync('components/Chatbot.tsx', 'utf8');

// We need to fetch the JWT and pass the auth header, plus gather context
// Let's modify handleSendMessage to include supabase auth and context.

const getContextReplacement = `
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Try to get token from Supabase if available
        let token = 'dummy-token';
        let contextData = null;
        try {
            const stored = localStorage.getItem('wallet_user');
            if (stored) {
               const user = JSON.parse(stored);
               token = user.id; // Just a rudimentary token for prototype
            }
            
            // Gather context
            const localData = localStorage.getItem('wallet_data');
            if (localData) {
                const parsed = JSON.parse(localData);
                const txs = parsed.transactions || [];
                const income = txs.filter(t => t.type === 'income').reduce((a,b)=>a+b.amount,0);
                const expenses = txs.filter(t => t.type !== 'income').reduce((a,b)=>a+b.amount,0);
                contextData = {
                    totalIncome: income,
                    totalExpenses: expenses,
                    netBalance: income - expenses,
                    recentTransactions: JSON.stringify(txs.slice(0, 5).map(t => ({name: t.name, amount: t.amount, type: t.type})))
                };
            }
        } catch(e) {}

        const userMessage: Message = { id: generateId(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Setup timeout using AbortController
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds

            const response = await fetch('/api/chat', {
                signal: controller.signal,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${token}\`
                },
                method: 'POST',
                body: JSON.stringify({ messages, input, contextData }),
            });
            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error(t('rateLimitError') || 'Too many requests. Please wait a moment.');
            }
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const botMessage: Message = { id: generateId(), text: data.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (err: any) {
            console.error("Gemini API error:", err);
            let errMsg = t('chatbotErrorApi');
            if (err.name === 'AbortError') errMsg = 'Request timed out. Please try again.';
            if (err.message) errMsg = err.message;
            setError(errMsg);
            const errorMessage: Message = { id: generateId(), text: errMsg, sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
`;

code = code.replace(/const handleSendMessage = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};/m, getContextReplacement);

fs.writeFileSync('components/Chatbot.tsx', code);
