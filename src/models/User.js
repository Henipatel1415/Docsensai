import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // Security Layer 1: Approval Workflow
  isApproved: { 
    type: Boolean, 
    default: false 
  },

  // Security Layer 2: Hierarchical Power (Invite Permission)
  canInvite: {
    type: Boolean,
    default: false
  },

  // --- 🔒 Password Reset Fields (Ab Schema ke andar hain) ---
  resetPasswordToken: String,
  resetPasswordExpires: Date

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;