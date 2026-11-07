const nodemailer = require("nodemailer");

const APP_NAME = process.env.APP_NAME || "JobBoard";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

const TONES = {
  primary: { accent: "#2563eb", soft: "#eff6ff", border: "#dbeafe" },
  success: { accent: "#16a34a", soft: "#f0fdf4", border: "#bbf7d0" },
  warning: { accent: "#d97706", soft: "#fffbeb", border: "#fde68a" },
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const titleCase = (value = "") =>
  String(value)
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const stripTags = (value) => value.replace(/<[^>]+>/g, "");

const TEMPLATES = {
  register: {
    tone: "primary",
    subject: `Welcome to ${APP_NAME} – verify your email address`,
    preheader: `Use your verification code to activate your ${APP_NAME} account.`,
    heading: "Verify your email address",
    body: `Thank you for signing up with <strong>${APP_NAME}</strong>. To finish creating your account, please enter the verification code below.`,
    otpLabel: "Email verification code",
    notice:
      "If you didn’t create an account, you can safely ignore this email.",
  },
  login: {
    tone: "primary",
    subject: `Your ${APP_NAME} sign-in code`,
    preheader: `Use this code to complete your sign-in to ${APP_NAME}.`,
    heading: "Confirm your sign-in",
    body: `We received a request to sign in to your <strong>${APP_NAME}</strong> account. Enter the code below to continue.`,
    otpLabel: "Sign-in verification code",
    notice:
      "If this wasn’t you, we recommend resetting your password right away.",
  },
  verify_otp: {
    tone: "success",
    subject: `Your email has been verified – ${APP_NAME}`,
    preheader: `Your ${APP_NAME} account is now active.`,
    heading: "Email verified successfully",
    body: `Your email address has been verified and your <strong>${APP_NAME}</strong> account is now active. You can start using all features right away.`,
    notice:
      "If you didn’t make this request, please contact our support team immediately.",
  },
  resend_otp: {
    tone: "primary",
    subject: `Your new ${APP_NAME} verification code`,
    preheader: `Here is your new verification code for ${APP_NAME}.`,
    heading: "Your new verification code",
    body: "As requested, here is a new verification code. Any code we sent you earlier is no longer valid.",
    otpLabel: "New verification code",
    notice:
      "If you didn’t request a new code, you can safely ignore this email.",
  },
  forgot_password: {
    tone: "warning",
    subject: `Reset your ${APP_NAME} password`,
    preheader: `Use this code to reset your ${APP_NAME} password.`,
    heading: "Password reset request",
    body: `We received a request to reset the password for your <strong>${APP_NAME}</strong> account. Use the code below to continue.`,
    otpLabel: "Password reset code",
    notice:
      "If you didn’t request a password reset, no action is needed — your password will remain unchanged.",
  },
  reset_password: {
    tone: "success",
    subject: `Your ${APP_NAME} password was changed`,
    preheader: "Your password has been updated successfully.",
    heading: "Password changed successfully",
    body: `The password for your <strong>${APP_NAME}</strong> account has been updated. You can now sign in with your new password.`,
    notice: `If you didn’t make this change, please reset your password immediately and contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb;text-decoration:none">${SUPPORT_EMAIL}</a>.`,
  },
};

const renderHtml = (template, { name, otp, expiryMinutes }) => {
  const tone = TONES[template.tone];
  const greeting = name ? `Hello ${escapeHtml(titleCase(name))},` : "Hello,";

  const highlight = template.otpLabel
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px">
        <tr>
          <td align="center" style="padding:22px 16px;background-color:${tone.soft};border:1px solid ${tone.border};border-radius:8px">
            <p style="margin:0 0 8px;font-size:12px;line-height:18px;letter-spacing:1px;text-transform:uppercase;color:#6b7280">${template.otpLabel}</p>
            <p style="margin:0;font-size:34px;line-height:42px;font-weight:700;letter-spacing:8px;color:${tone.accent};font-family:'Courier New',Courier,monospace">${escapeHtml(otp)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:13px;line-height:21px;color:#4b5563">This code expires in <strong>${expiryMinutes} minutes</strong>. For your security, never share it with anyone — ${APP_NAME} will never ask for it.</p>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px">
        <tr>
          <td align="center" width="56" height="56" style="width:56px;height:56px;border-radius:50%;background-color:${tone.soft};border:1px solid ${tone.border};font-size:28px;line-height:56px;font-weight:700;color:${tone.accent}">&#10003;</td>
        </tr>
      </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#f4f6f8">${template.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <tr>
            <td style="height:4px;background-color:${tone.accent};font-size:0;line-height:0">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:24px 28px 0;font-size:18px;font-weight:700;color:#111827">${APP_NAME}</td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px">
              <h2 style="margin:0 0 20px;font-size:22px;line-height:30px;font-weight:700;color:#111827">${template.heading}</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#4b5563">${greeting}</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#4b5563">${template.body}</p>
              ${highlight}
              <p style="margin:0;font-size:13px;line-height:21px;color:#6b7280">${template.notice}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid #e5e7eb;background-color:#f9fafb;text-align:center">
              <p style="margin:0 0 4px;font-size:12px;line-height:18px;color:#9ca3af">Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#6b7280;text-decoration:underline">${SUPPORT_EMAIL}</a></p>
              <p style="margin:0;font-size:12px;line-height:18px;color:#9ca3af">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const renderText = (template, { name, otp, expiryMinutes }) =>
  [
    name ? `Hello ${titleCase(name)},` : "Hello,",
    "",
    stripTags(template.body),
    "",
    ...(template.otpLabel
      ? [
          `${template.otpLabel}: ${otp}`,
          "",
          `This code expires in ${expiryMinutes} minutes. Never share it with anyone.`,
          "",
        ]
      : []),
    stripTags(template.notice),
    "",
    `— The ${APP_NAME} Team`,
    `Need help? ${SUPPORT_EMAIL}`,
  ].join("\n");

exports.sendEmail = async ({
  email,
  type,
  name = "",
  otp,
  expiryMinutes = 5,
}) => {
  try {
    const template = TEMPLATES[type];
    if (!template) {
      throw new Error(
        `Unknown email type "${type}". Use one of: ${Object.keys(TEMPLATES).join(", ")}`,
      );
    }
    if (template.otpLabel && !otp) {
      throw new Error(`OTP is required for email type "${type}"`);
    }

    const data = { name, otp, expiryMinutes };
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      text: renderText(template, data),
      html: renderHtml(template, data),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send "${type}" email to ${email}:`, error.message);
    return { success: false, error };
  }
};
