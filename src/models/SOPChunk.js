import mongoose from 'mongoose';

// 1. Model for SOP Chunks (Existing + Security Updates)
const sopChunkSchema = new mongoose.Schema({
  documentName: { type: String, required: true },
  page: { 
    type: String, 
    required: false, 
    default: "multi" 
  },
  section: { type: String },
  chunkText: { type: String, required: true },
  embedding: { type: [Number], required: true },
  
  // PROFESSIONAL ADDITIONS:
  // Role based access: e.g., ['admin', 'employee']
  allowedRoles: { 
    type: [String], 
    default: ['admin', 'employee'] 
  },
  // Audit trail
  uploadedAt: { type: Date, default: Date.now },
  category: { type: String, default: "General" }
});

// 2. NEW MODEL: Query Logs (Admin Analytics ke liye)
// Ye model track karega ki kisne kya pucha aur AI ne source diya ya nahi
const queryLogSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String }, // Optional: User identification ke liye
    question: { type: String, required: true },
    hasSource: { type: Boolean, default: false }, // Kya PDF se answer mila?
    sourceName: { type: String, default: null }, // Kaunsi file use hui
    timestamp: { type: Date, default: Date.now }
});

export const QueryLog = mongoose.model('QueryLog', queryLogSchema);
export default mongoose.model('SOPChunk', sopChunkSchema);