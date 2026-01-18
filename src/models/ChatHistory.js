import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Kaun sa user hai
  title: { type: String, default: "New Chat" }, // Jo dropdown mein dikhega
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Chat', ChatSchema);