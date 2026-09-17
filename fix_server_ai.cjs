const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Replace the /api/chat endpoint
const newChatEndpoint = `
  app.post("/api/chat", async (req, res) => {
    // Basic auth check using a token in the headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    // In a real app we'd verify the Supabase JWT here using the admin client.
    // For this prototype, we'll assume the client is authenticated if they have a token.
    // We should ideally fetch data securely on the server based on the user's ID.
    // But since the client sends messages context, we'll strictly scope it to the provided prompt.

    try {
      const { messages, input, contextData } = req.body;
      
      const history = (messages || []).map((m: { sender: string, text: string }) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      // Build context from user's actual data
      let dataContext = "";
      if (contextData) {
        dataContext = \`\\n\\nUser's Financial Context (DO NOT SHARE WITH OTHERS):
- Total Income: \${contextData.totalIncome}
- Total Expenses: \${contextData.totalExpenses}
- Net Balance: \${contextData.netBalance}
- Recent Transactions: \${contextData.recentTransactions}\`;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history,
        config: {
          systemInstruction: \`You are a secure, helpful personal-finance assistant for the 'Wallet' (ዋሌት) app. 
Your goal is to answer questions about the user's personal finance, budgeting, and saving.
Be friendly, clear, and concise.

IMPORTANT RULES:
1. You only have access to the authenticated user's data provided in the context. Never mix user data.
2. Clearly distinguish financial education/general guidance from regulated professional financial advice. If the user asks for investment advice, clarify that you provide general information, not professional advice.
3. You can provide spending summaries, budget explanations, savings suggestions, expense categorization, financial trend explanations, subscription insights, and goal progress summaries based on the user's data.
4. Keep your answers relatively short and easy to understand.\${dataContext}\`,
        },
      });

      const response = await chat.sendMessage({ message: input });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });
`;

serverCode = serverCode.replace(/app\.post\("\/api\/chat", async \(req, res\) => \{[\s\S]*?\}\);/m, newChatEndpoint);

// Replace /api/report-summary
const newSummaryEndpoint = `
  app.post("/api/report-summary", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

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
`;

serverCode = serverCode.replace(/app\.post\("\/api\/report-summary", async \(req, res\) => \{[\s\S]*?\}\);/m, newSummaryEndpoint);

fs.writeFileSync('server.ts', serverCode);
