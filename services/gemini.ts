
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAiSuggestions = async (dramaTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a C-Drama expert in the year 2077. Provide 3 futuristic reasons why someone should watch the drama "${dramaTitle}". Keep it cool and cyberpunk-themed. Output as a bulleted list.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The neural network is currently recalibrating. Check back for AI insights soon.";
  }
};
