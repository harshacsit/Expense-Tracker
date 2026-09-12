const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    return null;
  }
  try {
    return new Resend(apiKey);
  } catch (err) {
    console.warn('⚠️ Resend initialization warning:', err.message);
    return null;
  }
};

/**
 * Send a password reset email via Resend
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Full URL with reset token
 * @param {string} userName - Recipient's name
 */
const sendPasswordResetEmail = async (to, resetLink, userName = 'there') => {
  const resend = getResendClient();
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not configured. Skipping password reset email dispatch.');
    throw new Error('Email service is not configured (RESEND_API_KEY is missing).');
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'FairShare <onboarding@resend.dev>',
    to,
    subject: 'Reset your FairShare password',
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
              <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🏠 FairShare</div>
              <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Shared expense management</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#fff;font-size:22px;font-weight:700;">Reset your password</h2>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
                Hi ${userName}! Someone (hopefully you) requested a password reset for your FairShare account.
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
              <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">© ${new Date().getFullYear()} FairShare. All rights reserved.</p>
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

/**
 * Send a polite balance reminder email via Resend
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.debtorName - Name of the person who owes
 * @param {string} params.houseName - Name of the house
 * @param {number} params.amount - Total amount owed
 * @param {string} params.currencySymbol - Currency symbol (e.g. ₹, $, €)
 * @param {Array} params.settlements - Array of specific settlement suggestions
 */
const sendBalanceReminderEmail = async ({ to, debtorName, houseName, amount, currencySymbol = '₹', settlements = [] }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not configured. Skipping balance reminder email dispatch.');
    throw new Error('Email service is not configured (RESEND_API_KEY is missing).');
  }

  const settlementListHtml = settlements.length > 0
    ? `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin:20px 0;">
        <div style="color:#a78bfa;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Recommended Payments:</div>
        ${settlements.map(s => `
          <div style="color:#fff;font-size:14px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            Pay <strong style="color:#38bdf8;">${s.toName}</strong>: <strong style="color:#4ade80;">${currencySymbol}${s.amount}</strong>
          </div>
        `).join('')}
      </div>
    `
    : '';

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'FairShare <onboarding@resend.dev>',
    to,
    subject: `Friendly reminder: Pending balance in ${houseName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Balance Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#12121e,#1a1a2e);border:1px solid rgba(96,112,245,0.25);border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;background:linear-gradient(135deg,#6070f5,#a855f7);text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🏠 FairShare</div>
              <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Shared expense reminder</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#fff;font-size:22px;font-weight:700;">Balance Reminder for ${houseName}</h2>
              <p style="margin:0 0 20px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
                Hi ${debtorName || 'there'}! This is a friendly reminder regarding your shared expenses in <strong>${houseName}</strong>.
              </p>
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:16px;text-align:center;margin:24px 0;">
                <div style="color:rgba(255,255,255,0.5);font-size:13px;">Your Current Net Balance:</div>
                <div style="color:#f87171;font-size:32px;font-weight:800;margin-top:4px;">-${currencySymbol}${Math.abs(amount).toFixed(2)}</div>
              </div>
              ${settlementListHtml}
                Please log in to your FairShare dashboard to view full transaction breakdowns or record a settlement once paid.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">© ${new Date().getFullYear()} FairShare. All rights reserved.</p>
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

module.exports = { sendPasswordResetEmail, sendBalanceReminderEmail };
