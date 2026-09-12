const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { register, login, getMe, forgotPassword, resetPassword, googleCallback, deleteAccount } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ─── Google OAuth Strategy Setup (only if credentials are configured) ─────────
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleConfigured =
  googleClientId && googleClientId !== 'your_google_client_id_here' &&
  googleClientSecret && googleClientSecret !== 'your_google_client_secret_here';

if (googleConfigured) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || email?.split('@')[0] || 'User';
          const avatar = profile.photos?.[0]?.value || null;
          const googleId = profile.id;

          console.log(`[Google Auth] User profile received: ${email} (${name}, ID: ${googleId})`);

          if (!email) return done(new Error('No email returned from Google account'), null);

          let user = await User.findOne({ $or: [{ googleId }, { email }] });

          if (user) {
            if (!user.googleId) {
              user.googleId = googleId;
              if (avatar) user.avatar = avatar;
              await user.save({ validateBeforeSave: false });
              console.log(`[Google Auth] Linked existing account: ${email}`);
            }
          } else {
            user = await User.create({ name, email, googleId, avatar });
            console.log(`[Google Auth] Created new user: ${email}`);
          }

          return done(null, user);
        } catch (err) {
          console.error('[Google Auth Strategy Error]:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
} else {
  console.warn('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable it.');
}

// ─── Standard Auth Routes ─────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.delete('/account', protect, deleteAccount);

// ─── Forgot / Reset Password Routes ──────────────────────────────────────────
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ─── Google OAuth Routes ──────────────────────────────────────────────────────
const googleNotConfigured = (req, res) =>
  res.status(503).json({ message: 'Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });

if (googleConfigured) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (err) {
        console.error('❌ [Google Callback Error]:', err);
        const msg = encodeURIComponent(err.message || 'Google authentication failed');
        return res.redirect(`${frontendUrl}/login?error=${msg}`);
      }
      if (!user) {
        console.error('❌ [Google Callback No User]:', info);
        const msg = encodeURIComponent(info?.message || 'Access denied by Google');
        return res.redirect(`${frontendUrl}/login?error=${msg}`);
      }
      req.user = user;
      return googleCallback(req, res);
    })(req, res, next);
  });
} else {
  router.get('/google', googleNotConfigured);
  router.get('/google/callback', googleNotConfigured);
}

module.exports = router;
