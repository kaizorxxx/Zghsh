
import { GoogleGenAI } from "@google/genai";

// Initialize the client safely to avoid crashing in environments where process is undefined
let ai: GoogleGenAI | null = null;

try {
  // Check if process exists and has env before accessing to prevent ReferenceError
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
  
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("Gemini API Key missing or process.env not accessible. AI features will be disabled.");
  }
} catch (err) {
  console.error("Error initializing Gemini client:", err);
}

export const getAiSuggestions = async (dramaTitle: string) => {
  // Fail gracefully if AI failed to init
  if (!ai) {
    return "Neural uplink offline. AI insights unavailable.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a C-Drama expert in the year 2077. Provide 3 futuristic reasons why someone should watch the drama "${dramaTitle}". Keep it cool and cyberpunk-themed. Output as a bulleted list.`,
    });
    // Access the .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The neural network is currently recalibrating. Check back for AI insights soon.";
  }
};
