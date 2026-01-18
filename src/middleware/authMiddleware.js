import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ JWT_SECRET is missing in .env file!");
      return res.status(500).json({ message: "Internal Server Configuration Error" });
    }

    // 1️⃣ Token verify
    const decoded = jwt.verify(token, secret);

    // 2️⃣ 🔥 FRESH USER FROM DB (MAIN FIX)
    const freshUser = await User.findById(decoded.id).select('-password');
    if (!freshUser) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 3️⃣ Attach fresh user (NOT token data)
    req.user = {
      id: freshUser._id,
      email: freshUser.email,
      role: freshUser.role,
      canInvite: freshUser.canInvite
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};
