import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import rateLimit from 'express-rate-limit';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rate Limiting Middleware
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
  });

  // Apply middlewares to API routes
  app.use('/api/', apiLimiter);

  // Auth Middleware

  
  
  // Note: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be in process.env when server runs.
  // Actually, VITE_ prefixed vars might not be in process.env depending on how it's started, but AI Studio injects them.
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
  );

  const requireAuth = async (req: express.Request & { token?: string, user?: any }, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    req.user = user;
    next();
  };

  // API endpoints
  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const { messages, input, contextData } = req.body;
      
      const history = (messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      // Build context from user's actual data
      let dataContext = "";
      if (contextData) {
        dataContext = `\n\nUser's Financial Context (DO NOT SHARE WITH OTHERS):
- Total Income: ${contextData.totalIncome}
- Total Expenses: ${contextData.totalExpenses}
- Net Balance: ${contextData.netBalance}
- Recent Transactions: ${contextData.recentTransactions}`;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history,
        config: {
          systemInstruction: `You are a secure, helpful personal-finance assistant for the 'Wallet' (ዋሌት) app. 
Your goal is to answer questions about the user's personal finance, budgeting, and saving.
Be friendly, clear, and concise.

IMPORTANT RULES:
1. You only have access to the authenticated user's data provided in the context. Never mix user data.
2. Clearly distinguish financial education/general guidance from regulated professional financial advice. If the user asks for investment advice, clarify that you provide general information, not professional advice.
3. You can provide spending summaries, budget explanations, savings suggestions, expense categorization, financial trend explanations, subscription insights, and goal progress summaries based on the user's data.
4. Keep your answers relatively short and easy to understand.${dataContext}`,
        },
      });

      const response = await chat.sendMessage({ message: input });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });

  app.post("/api/meal-plan", requireAuth, async (req, res) => {
    try {
      const { shoppingItems } = req.body;
      const prompt = `
          Based on the following available ingredients from a shopping list: ${shoppingItems}.
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
      `;
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

  app.post("/api/report-summary", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
           systemInstruction: "You are a secure financial assistant. Only use the provided user data. Provide general guidance, not regulated financial advice."
        }
      });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
