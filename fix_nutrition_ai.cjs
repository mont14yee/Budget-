const fs = require('fs');
let code = fs.readFileSync('components/NutritionView.tsx', 'utf8');

const newGen = `
    const handleGenerateMealPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            let token = 'dummy-token';
            const stored = localStorage.getItem('wallet_user');
            if (stored) {
               token = JSON.parse(stored).id;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('/api/meal-plan', {
                signal: controller.signal,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${token}\`
                },
                method: 'POST',
                body: JSON.stringify({ shoppingItems: items.join(', ') }),
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            setMealPlan(JSON.parse(data.text));
        } catch (err: any) {
            console.error('Failed to generate meal plan:', err);
            let errMsg = 'Failed to generate meal plan. Please try again.';
            if (err.name === 'AbortError') errMsg = 'Request timed out. Please try again.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };
`;

code = code.replace(/const handleGenerateMealPlan = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/m, newGen);
fs.writeFileSync('components/NutritionView.tsx', code);
