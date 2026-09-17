const fs = require('fs');
let code = fs.readFileSync('components/NutritionView.tsx', 'utf8');

const newGen = `
    const handleGenerateMealPlan = async () => {
        setIsLoading(true);
        setError(null);
        setMealPlan(null);
        const shoppingItems = shoppingList.map(item => item.name).join(', ');
        if (!shoppingItems) {
            setError(t('mealPlanErrorEmptyList'));
            setIsLoading(false);
            return;
        }

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
                body: JSON.stringify({ shoppingItems })
            });

            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment.');
            }
            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            
            // Clean up possible markdown wrapper
            let jsonStr = data.text.trim();
            if (jsonStr.startsWith('\`\`\`json')) {
                jsonStr = jsonStr.substring(7);
                if (jsonStr.endsWith('\`\`\`')) {
                    jsonStr = jsonStr.substring(0, jsonStr.length - 3);
                }
            }
            jsonStr = jsonStr.trim();
            
            const parsedPlan = JSON.parse(jsonStr) as MealPlan;
            setMealPlan(parsedPlan);
        } catch (err: any) {
            console.error("Error generating meal plan:", err);
            let errMsg = t('mealPlanErrorGeneric');
            if (err.name === 'AbortError') errMsg = 'Request timed out. Please try again.';
            if (err.message && err.message.includes('Too many requests')) errMsg = err.message;
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };
`;

code = code.replace(/const handleGenerateMealPlan = async \(\) => \{[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};/m, newGen);
fs.writeFileSync('components/NutritionView.tsx', code);
