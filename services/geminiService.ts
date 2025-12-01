import { GoogleGenAI, Type } from "@google/genai";
import { InteractionResult } from "../types";

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