const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The meal-plan endpoint needs auth as well!
const newMealPlan = `
  app.post("/api/meal-plan", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    
    try {
      const { shoppingItems } = req.body;
      const prompt = \`
          Based on the following available ingredients from a shopping list: \${shoppingItems}.
          Please act as a nutritionist and create a comprehensive 1-day meal plan that adheres to the principles of a balanced diet.
          The meal plan should include breakfast, lunch, dinner, and one snack.
          Each meal should be balanced and nutritious.
          For each meal, provide:
          1. A creative recipe name.
          2. A list of ingredients with quantities.
          3. Detailed step-by-step preparation instructions.
          4. An estimated calorie count for the meal.
          Finally, provide the total estimated calorie count for the entire day.
          Ensure the response is in a structured JSON format.
      \`;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mealPlan: {
                type: Type.ARRAY,
                description: "List of meals for the day.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mealType: {
                      type: Type.STRING,
                      description: "Type of meal (e.g., Breakfast, Lunch, Dinner, Snack).",
                    },
                    recipeName: { type: Type.STRING, description: "The name of the recipe." },
                    ingredients: {
                      type: Type.ARRAY,
                      description: "List of ingredients for the recipe.",
                      items: { type: Type.STRING },
                    },
                    instructions: {
                      type: Type.STRING,
                      description: "Step-by-step preparation instructions.",
                    },
                    calories: {
                      type: Type.NUMBER,
                      description: "Estimated calorie count for the meal.",
                    },
                  },
                },
              },
              totalCalories: {
                type: Type.NUMBER,
                description: "Total estimated calories for the entire day.",
              },
            },
          },
        },
      });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });
`;

code = code.replace(/app\.post\("\/api\/meal-plan", async \(req, res\) => \{[\s\S]*?\}\);/m, newMealPlan);

fs.writeFileSync('server.ts', code);
