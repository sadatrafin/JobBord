const nodemailer = require("nodemailer");
exports.sendEmail = async (email, otp, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Verify Your Email Address – ${name.replace(/\b\w/g, (char) => char.toUpperCase())}`,
      text: `Your OTP is ${otp}. It expires in 5 minutes. Do not share it with anyone.`,
      html: `<table border=0 cellpadding=0 cellspacing=0 role=presentation width=100% style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f6f8;padding:24px 12px;color:#1f2937"><tr><td align=center><table border=0 cellpadding=0 cellspacing=0 role=presentation width=100% style="max-width:480px;background-color:#fff;border:1px solid #e5e7eb;border-radius:8px"><tr><td style="padding:28px 24px"><h2 style="margin:0 0 20px;font-size:22px;line-height:30px;color:#111827;font-weight:700">Verify Your Email</h2><p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#4b5563">Hello,<p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#4b5563">Thank you for registering with <strong style="text-transform: capitalize">${name}</strong>. Use the verification code below to complete your registration.<table border=0 cellpadding=0 cellspacing=0 role=presentation width=100%><tr><td style="padding:20px;background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:6px"align=center><p style="margin:0 0 8px;font-size:12px;line-height:18px;color:#6b7280">YOUR VERIFICATION CODE<p style=margin:0;font-size:32px;line-height:40px;font-weight:700;letter-spacing:6px;color:#2563eb> ${otp} </table><p style="margin:20px 0 16px;font-size:13px;line-height:21px;color:#4b5563">This code expires in <strong>5 minutes</strong>. For your security, please do not share this code with anyone.<p style=margin:0;font-size:13px;line-height:21px;color:#6b7280>If you didn't create an account, please ignore this email.<tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;background-color:#f9fafb;border-radius:0 0 8px 8px"><p style=margin:0;text-align:center;font-size:12px;line-height:18px;color:#9ca3af>© 2026 JobBoard. All rights reserved.</table></table>`,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
