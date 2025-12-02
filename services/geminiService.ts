import { GoogleGenAI, Type } from "@google/genai";
import { InteractionResult, Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  /**
   * Checks for drug interactions between a list of medicine names.
   */
  checkInteractions: async (medicines: string[]): Promise<InteractionResult> => {
    if (medicines.length < 2) {
      return { hasInteraction: false, warnings: [], recommendation: 'Safe to proceed.' };
    }

    try {
      const prompt = `Analyze the following list of medications for potential drug interactions: ${medicines.join(', ')}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasInteraction: { type: Type.BOOLEAN },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendation: { type: Type.STRING }
            },
            required: ['hasInteraction', 'warnings', 'recommendation']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as InteractionResult;
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Fallback in case of API error
      return {
        hasInteraction: false,
        warnings: ["Could not verify interactions at this time. Please consult a pharmacist."],
        recommendation: "Proceed with caution."
      };
    }
  },

  /**
   * Performs an intelligent search over a list of products using Gemini.
   * Understands symptoms, typos, and medical terminology.
   */
  smartSearch: async (query: string, products: Product[]): Promise<string[]> => {
    try {
      // Simplify product list to save tokens, only sending necessary fields
      const productContext = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category
      }));

      const prompt = `
        You are an intelligent search engine for a pharmacy.
        User Query: "${query}"
        
        Task: Match the user query to the provided products.
        - Analyze symptoms (e.g., "my head hurts" -> painkillers).
        - Understand medical terms (e.g., "hypertension" -> BP monitor).
        - Handle typos and natural language.
        - If the query is vague, return the best possible matches.
        
        Product List: ${JSON.stringify(productContext)}
        
        Return ONLY a JSON object with a "productIds" property containing an array of matching product IDs.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text || '{"productIds": []}');
      return result.productIds;
    } catch (error) {
      console.error("AI Search Error:", error);
      return []; 
    }
  },

  /**
   * General health assistant chat.
   */
  askHealthAssistant: async (query: string, context?: string): Promise<string> => {
    try {
      const prompt = `
        You are an AI assistant for a Kenyan E-Pharmacy called AfyaBora. 
        Your goal is to help users find products, understand dosages, or get general health advice.
        Do not provide medical diagnoses. Always recommend seeing a doctor for serious issues.
        
        Context (optional): ${context || 'None'}
        
        User Query: ${query}
        
        Answer concisely and helpfully.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text || "I'm sorry, I couldn't understand that request.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "I am currently unavailable. Please try again later.";
    }
  }
};