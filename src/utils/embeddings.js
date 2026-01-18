import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getEmbedding = async (text) => {
  try {
    if (!text?.trim()) return null;
    
    // Latest model for 768 dimensions
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error("[Embedding Error]:", err.message);
    throw err;
  }
};