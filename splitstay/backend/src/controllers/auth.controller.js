const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/email.service');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'splitstay_jwt_secret_dev_fallback_key_2024';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Authenticate user & get token
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If user has no password, they signed up with Google
    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
  });
};

// @desc  Send password reset email
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email address' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Google-only accounts can't reset password
    if (!user.password && user.googleId) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink, user.name);
      res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (emailErr) {
      // Rollback token if email fails
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save({ validateBeforeSave: false });
      console.error('Email error:', emailErr.message);
      res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Reset password using token
// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the incoming plain token to compare against stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      message: 'Password reset successfully. You can now sign in.',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Handle Google OAuth callback — find/create user, return JWT via redirect
// @route GET /api/auth/google/callback  (called by passport after Google auth)
const googleCallback = (req, res) => {
  try {
    const user = req.user; // set by passport
    if (!user) throw new Error('No authenticated user object found');
    const token = generateToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    console.log(`[Google Auth] Successfully generated session for user: ${user.email}`);

    // Redirect to frontend OAuth callback page with token as query param
    res.redirect(
      `${frontendUrl}/oauth/callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&id=${user._id}`
    );
  } catch (error) {
    console.error('❌ [Google Callback Controller Error]:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
};

// @desc  Delete user account & Right to Be Forgotten (GDPR - BRD §7)
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Anonymize user record to preserve balance ledger integrity while purging credentials
    await User.findByIdAndUpdate(userId, {
      name: 'Former Member',
      email: `deleted_${userId}@splitstay.local`,
      password: null,
      googleId: null,
      avatar: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ message: 'Account successfully deleted and personal data anonymized.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, googleCallback, deleteAccount };
