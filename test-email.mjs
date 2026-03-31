import nodemailer from "nodemailer"
import "dotenv/config"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

try {
  await transporter.sendMail({
    from:    `"ClubHub IIST" <${process.env.EMAIL_USER}>`,
    to:      process.env.EMAIL_USER,
    subject: "✅ ClubHub Email Test",
    html: `
      <div style="font-family:sans-serif;padding:20px;background:#0a0520;color:#fff;border-radius:12px;">
        <h2 style="color:#a78bfa;">🎉 Email is working!</h2>
        <p>Your ClubHub email notification system is set up correctly.</p>
        <p style="color:#6b7280;font-size:13px;">Sent from: ${process.env.EMAIL_USER}</p>
      </div>
    `,
  })
  console.log("✅ Email sent successfully! Check your inbox.")
} catch (err) {
  console.error("❌ Email failed:", err.message)
}