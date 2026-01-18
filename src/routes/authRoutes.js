import express from 'express';
import { login, register, createInvite, googleLogin, getAllAdmins, forgotPassword, resetPassword } from '../controllers/authController.js'; 
import { verifyToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// --- AUTH ROUTES ---
router.post('/login', login);
router.post('/signup', register); 
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 🔐 Invite route – permission DB se verify hogi
router.post('/invite', verifyToken, async (req, res, next) => {
  try {
    // 🔥 MAIN FIX: Fresh DB check
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.canInvite) {
      return res.status(403).json({ message: "Invite access revoked. Please login again." });
    }

    // permission valid → controller call
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Permission check failed" });
  }
}, createInvite);

// --- ADMIN MANAGEMENT ROUTES ---

// 1. Fetch All Admins
router.get('/all-admins', verifyToken, async (req, res, next) => {
  try {
    // 🔥 Fresh DB sync
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Auth sync failed" });
  }
}, getAllAdmins);

// 2. Toggle Invite Access
router.put('/toggle-access/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { canInvite } = req.body;

    // 🔥 DB based Head Admin check
    const requester = await User.findById(req.user.id);
    if (!requester) {
      return res.status(401).json({ message: "Invalid requester" });
    }

    const isHeadAdmin =
      requester.email.toLowerCase().trim() ===
      process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();

    if (!isHeadAdmin) {
      return res.status(403).json({ message: "Only Master Admin can change permissions!" });
    }

    const adminToUpdate = await User.findById(id);
    if (!adminToUpdate) {
      return res.status(404).json({ message: "Admin nahi mila" });
    }

    // 🛡️ Head admin protection
    if (
      adminToUpdate.email.toLowerCase().trim() ===
      process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim()
    ) {
      return res.status(403).json({ message: "Master Access cannot be modified!" });
    }

    adminToUpdate.canInvite = canInvite;
    await adminToUpdate.save();

    res.status(200).json({
      message: "Access Updated",
      user: {
        id: adminToUpdate._id,
        email: adminToUpdate.email,
        canInvite: adminToUpdate.canInvite
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// 3. Remove Admin
router.delete('/remove-admin/:id', verifyToken, async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    if (!requester) {
      return res.status(401).json({ message: "Invalid requester" });
    }

    const isHeadAdmin =
      requester.email.toLowerCase().trim() ===
      process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();

    if (!isHeadAdmin) {
      return res.status(403).json({ message: "Unauthorized: Only Master Admin can remove admins" });
    }

    const adminToDelete = await User.findById(req.params.id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      adminToDelete.email.toLowerCase().trim() ===
      process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim()
    ) {
      return res.status(400).json({ message: "Master Account cannot be removed!" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Admin removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Remove failed", error: err.message });
  }
});

export default router;
