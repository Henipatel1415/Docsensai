import SOPChunk from "../models/SOPChunk.js";
import { parsePDF } from "../utils/pdfUtils.js";
import { getEmbedding } from "../utils/embeddings.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ---------------- 1. PDF UPLOAD (CLEANED) ---------------- */
export const uploadSOP = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { originalname, buffer } = req.file;

    // Pehle purana data delete karein taaki 768 dimensions fresh rahein
    await SOPChunk.deleteMany({ documentName: originalname });

    const chunks = await parsePDF(buffer, originalname);
    const docs = [];

    for (const c of chunks) {
      const embedding = await getEmbedding(c.chunkText);
      // Ensure karein ki embedding ki length 768 hai
      if (embedding) {
        docs.push({ ...c, embedding });
      }
    }

    await SOPChunk.insertMany(docs);
    res.json({ success: true, message: `Successfully ingested ${docs.length} chunks.` });
  } catch (e) {
    console.error("Upload Error:", e.message);
    res.status(500).json({ error: e.message });
  }
};

/* ---------------- 2. CHAT ASK (SMART & FLEXIBLE) ---------------- */
export const askQuestion = async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question) return res.status(400).json({ error: "Question is required" });

    // 1. Get embedding for the user question (768 dimensions)
    const queryEmbedding = await getEmbedding(question);

    // 2. Vector Search in MongoDB
    const results = await SOPChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Iska naam MongoDB Atlas mein exact yahi hona chahiye
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10
        }
      }
    ]);

    // Debugging: Terminal mein check karein data aa raha hai ya nahi
    console.log(`Found ${results.length} relevant chunks for this question.`);

    // 3. Build context from retrieved chunks
    let context = "";
    results.forEach(r => {
      context += `[Source: ${r.documentName}, Page: ${r.page}]\n${r.chunkText}\n\n`;
    });

    // 4. Groq Completion with ChatGPT-like flexibility
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ChatGPT jaisa bada model use karein
      messages: [
        {
          role: "system",
          content: "You are a highly intelligent AI assistant. Use the provided context to answer questions accurately. If the context doesn't have the answer, use your general knowledge to help, but clearly state that this info is not in the document."
        },
        ...history.slice(-4), // Last 4 messages for conversation history
        { 
          role: "user", 
          content: `Document Context:\n${context || "No relevant document context found."}\n\nUser Question: ${question}` 
        }
      ],
      temperature: 0.5, // 0.2 se badha kar 0.5 kiya taaki ye ChatGPT jaisa creative lage
      max_tokens: 1024
    });

    const answer = completion.choices[0].message.content;
    
    // 5. Sources format karna
    const uniqueSources = [...new Set(results.map(r => `Page ${r.page}`))];

    res.json({ 
      answer, 
      sources: results.length > 0 ? uniqueSources : ["General Knowledge"] 
    });

  } catch (e) {
    console.error("Ask Error:", e.message);
    res.status(500).json({ error: e.message });
  }
};

/* ---------------- 3. LIST & DELETE ---------------- */
export const deleteSOP = async (req, res) => {
  try {
    const { name } = req.params;
    await SOPChunk.deleteMany({ documentName: name });
    res.json({ success: true, message: `Deleted ${name}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const listSOPs = async (req, res) => {
  try {
    const docs = await SOPChunk.distinct("documentName");
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};