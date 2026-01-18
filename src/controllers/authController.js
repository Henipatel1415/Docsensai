import User from '../models/User.js';
import Invite from '../models/Invite.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 1. REGISTER / SIGNUP LOGIC ---
export const register = async (req, res) => {
  try {
    const { name, password, token } = req.body; 
    const email = req.body.email.toLowerCase().trim();
    const HEAD_ADMIN_EMAIL = process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();

    console.log("🚀 Registration Attempt for:", email);

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    let finalRole = 'user';
    let finalApproval = true; 
    let canInvite = false;

    // Check if Head Admin
    if (email === HEAD_ADMIN_EMAIL) {
      finalRole = 'admin';
      canInvite = true;
    } 
    // Check if invited by another Admin
    else if (token) {
      const invite = await Invite.findOne({ email, token });
      if (invite) {
        if (invite.expiresAt > Date.now()) {
          finalRole = 'admin';
          canInvite = false; 
          await Invite.deleteOne({ _id: invite._id }); 
        } else {
          return res.status(400).json({ message: "Invite link has expired." });
        }
      } else {
        return res.status(400).json({ message: "Invalid invite link or email mismatch." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name, 
      email, 
      password: hashedPassword,
      role: finalRole,
      isApproved: finalApproval, 
      canInvite: canInvite
    });

    await newUser.save();
    res.status(201).json({ message: `Account created successfully as ${finalRole}!`, role: finalRole });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- 2. LOGIN LOGIC ---
export const login = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User nahi mila!" });

    if (user.role === 'admin' && !user.isApproved) {
      return res.status(403).json({ message: "Access Denied. Unauthorized Admin account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Galt password!" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role, canInvite: user.canInvite } 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- 3. GOOGLE LOGIN LOGIC ---
export const googleLogin = async (req, res) => {
  try {
    const { credential, inviteToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name } = ticket.getPayload();
    const normalizedEmail = email.toLowerCase().trim();
    const HEAD_ADMIN_EMAIL = process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();

    let finalRole = 'user';
    let canInvite = false;

    if (normalizedEmail === HEAD_ADMIN_EMAIL) {
      finalRole = 'admin';
      canInvite = true;
    } else if (inviteToken) {
      const invite = await Invite.findOne({ email: normalizedEmail, token: inviteToken });
      if (invite) {
        finalRole = 'admin';
        await Invite.deleteOne({ _id: invite._id }); 
      }
    }

    let user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      user = new User({
        name,
        email: normalizedEmail,
        role: finalRole,
        isApproved: true,
        password: Math.random().toString(36).slice(-8)
      });
      await user.save();
    } else if (normalizedEmail === HEAD_ADMIN_EMAIL) {
      user.role = 'admin';
      user.canInvite = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role, canInvite: user.canInvite } 
    });

  } catch (err) {
    res.status(500).json({ message: "Google Authentication failed" });
  }
};
export const getAllAdmins = async (req, res) => {
  try {
    // 1. Pehle dekho request karne wala user kaun hai (Database se fresh data lo)
    const freshUser = await User.findById(req.user.id);
    if (!freshUser) return res.status(404).json({ message: "User not found" });

    const isHead = freshUser.email.toLowerCase().trim() === process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();
    
    // 2. Agar wo Head Admin nahi hai AUR uske paas invite access bhi nahi hai, toh 403 do
    if (!isHead && !freshUser.canInvite) {
      return res.status(403).json({ message: "Access Denied: You don't have permission to view/manage admins" });
    }

    // 3. Agar permission hai, toh saare admins ki list dikhao
    const admins = await User.find({ role: 'admin' }).select('-password');
    const adminList = admins.map(adm => ({
      ...adm._doc,
      isHead: adm.email.toLowerCase().trim() === process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim()
    }));
    
    res.json(adminList);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// --- 5. CREATE INVITE (Fixed for Sub-Admins) ---
export const createInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Database se us Admin ki details nikalo jo invite bhejna chahta hai
    const requester = await User.findById(req.user.id);
    if (!requester) return res.status(404).json({ message: "Admin user not found" });

    const isHead = requester.email.toLowerCase().trim() === process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();

    // 2. SECURITY CHECK: Kya ye Head Admin hai? YA kya is Admin ko 'canInvite' access mila hai?
    // Screenshot 403 yahan se trigger ho raha tha
    if (!isHead && requester.canInvite !== true) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to send invites" });
    }

    // 3. Invite logic (Token generate karna)
    const token = crypto.randomBytes(32).toString('hex');
    await Invite.findOneAndUpdate(
      { email: normalizedEmail },
      { token, expiresAt: Date.now() + 86400000 }, 
      { upsert: true }
    );

    const inviteLink = `${process.env.FRONTEND_URL}/signup?token=${token}&email=${normalizedEmail}`;

    // 4. Email setup (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    const mailOptions = {
      from: `"OpsMind AI Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🛡️ Invitation to join OpsMind AI as Admin',
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">OpsMind AI</h2>
          <p>You have been invited to join as an <strong>Administrator</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
              Accept Invitation & Register
            </a>
          </div>
        </div>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Invite link sent!", inviteLink });
  } catch (err) {
    res.status(500).json({ message: "Email failed.", error: err.message });
  }
};
// --- 6. TOGGLE ACCESS (Head Admin control) ---
export const toggleInviteAccess = async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    const HEAD_ADMIN = process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();
    
    if (requester.email.toLowerCase().trim() !== HEAD_ADMIN) {
      return res.status(403).json({ message: "Only Head Admin can change permissions" });
    }

    const { adminId } = req.params;
    const { canInvite } = req.body;
    await User.findByIdAndUpdate(adminId, { canInvite });
    res.json({ message: "Access updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Toggle failed", error: err.message });
  }
};

// --- 7. REMOVE ADMIN (Updated Logic) ---
export const removeAdmin = async (req, res) => {
  try {
    const requesterId = req.user.id; // Jo remove karne ki koshish kar raha hai
    const targetAdminId = req.params.adminId; // Jise remove kiya ja raha hai

    const requester = await User.findById(requesterId);
    const HEAD_ADMIN_EMAIL = process.env.HEAD_ADMIN_EMAIL?.toLowerCase().trim();
    const isHeadAdmin = requester.email.toLowerCase().trim() === HEAD_ADMIN_EMAIL;

    // 1. Agar request karne wala Head Admin hai
    if (isHeadAdmin) {
      // Head Admin kisi ko bhi remove kar sakta hai, lekin khud ko nahi (taaki system lock na ho jaye)
      const adminToDelete = await User.findById(targetAdminId);
      if (adminToDelete.email.toLowerCase().trim() === HEAD_ADMIN_EMAIL) {
        return res.status(400).json({ message: "Master Account cannot be removed!" });
      }
      
      await User.findByIdAndDelete(targetAdminId);
      return res.json({ message: "Admin removed successfully by Head Admin." });
    }

    // 2. Agar request karne wala Sub-Admin hai
    // Wo sirf apni ID check karega, agar ID match hui toh delete karega, warna error
    if (requesterId === targetAdminId) {
      await User.findByIdAndDelete(requesterId);
      return res.json({ message: "Your account has been deleted successfully." });
    } else {
      // Agar Sub-Admin kisi aur ki ID bhej raha hai
      return res.status(403).json({ 
        message: "Permission Denied: You can only remove your own account." 
      });
    }

  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
 


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Security tip: Hum humesha 'success' message dete hain taaki koi email fish na kar sake
    if (!user) {
      return res.status(200).json({ message: "If an account exists with this email, a reset link has been sent." });
    }

    // 1. Reset Token banayein (1 ghante ke liye valid)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // 2. Email setup
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"OpsMind AI Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔒 Password Reset Request - OpsMind AI',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Aapne password reset karne ki request ki hai. Niche diye gaye button par click karein:</p>
          <a href="${resetLink}" style="background: #00684a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>Ye link 1 ghante mein expire ho jayega.</p>
        </div>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "If an account exists with this email, a reset link has been sent." });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 1. Token check karein aur dekhein ki kya wo expire toh nahi hua
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // $gt matlab 'Greater Than' (Expire nahi hua)
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // 2. Naya password hash karein
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 3. Token clear karein taaki wo dubara use na ho sake
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password updated successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
};