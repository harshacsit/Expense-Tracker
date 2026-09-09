const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a password reset email via Resend
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Full URL with reset token
 * @param {string} userName - Recipient's name
 */
const sendPasswordResetEmail = async (to, resetLink, userName = 'there') => {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'SplitStay <onboarding@resend.dev>',
    to,
    subject: 'Reset your SplitStay password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#12121e,#1a1a2e);border:1px solid rgba(96,112,245,0.25);border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;background:linear-gradient(135deg,#6070f5,#a855f7);text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🏠 SplitStay</div>
              <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Shared expense management</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#fff;font-size:22px;font-weight:700;">Reset your password</h2>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
                Hi ${userName}! Someone (hopefully you) requested a password reset for your SplitStay account.
                Click the button below to set a new password. This link expires in <strong style="color:#a78bfa;">10 minutes</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                   style="display:inline-block;padding:14px 36px;border-radius:12px;background:linear-gradient(135deg,#6070f5,#a855f7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                  Reset Password
                </a>
              </div>
              <p style="margin:0;color:rgba(255,255,255,0.35);font-size:13px;line-height:1.6;">
                If you didn't request this, you can safely ignore this email — your password won't change.<br/><br/>
                Or copy this link: <span style="color:#818cf8;word-break:break-all;">${resetLink}</span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">© ${new Date().getFullYear()} SplitStay. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = { sendPasswordResetEmail };
