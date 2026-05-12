import { GoogleGenAI } from "@google/genai";
import { INITIAL_MOCK_REPORTS } from "./data";

let aiClient: GoogleGenAI | null = null;

export function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set.");
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export async function processNLQuery(query: string): Promise<string> {
  const ai = getAiClient();
  
  // Format the "database" as a string for the prompt context
  const dbContext = INITIAL_MOCK_REPORTS.map(r => 
    `[Product: ${r.product}, Market: ${r.market}, Price: ${r.price} ${r.currency}/${r.unit}, Date: ${r.date}]`
  ).join("\n");

  const prompt = `
You are the WapiAI SMS/USSD Assistant for African informal commerce.
You help sellers and buyers find crop and product prices in local markets.

Here is the current market data from our database:
${dbContext}

Rules:
1. Provide a short, SMS-friendly response (under 160 characters if possible).
2. If the user asks for a price history, give a median or the latest.
3. If data is not available for their specific query, say "No recent data for [Item] in [Location]. Reply REPORT to share a price & earn credits."
4. Be helpful, direct, and conversational but concise. No markdown or formatting as this simulates SMS.

User Query: "${query}"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || "Sorry, I could not process that request.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Service temporarily unavailable. Please try again later.";
  }
}
