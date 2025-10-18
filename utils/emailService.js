// utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ensure env variables are loaded

// 1️⃣ Create a reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // helps with cloud servers like Render
  },
});

// Optional: verify connection
transporter.verify()
  .then(() => console.log("✅ Gmail SMTP server is ready to send emails"))
  .catch(err => console.error("❌ Gmail SMTP connection failed:", err.message));

// 2️⃣ Send Forgot Password Email
export const sendForgotPasswordEmail = async (to, newPassword, role = "USER") => {
  try {
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔐 BattleZone Password Reset — ${role} Account Credentials`,
      html: `<p>Your new password: <strong>${newPassword}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending forgot password email:", err.message);
    throw new Error("Failed to send password reset email. Please try again later.");
  }
};

// 3️⃣ Send OTP Email
export const sendOTPEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔐 BattleZone OTP Verification",
      html: `<p>Your OTP is: <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
    throw new Error("Failed to send OTP email");
  }
};

// 4️⃣ Send Tournament Created Email
export const sendTournamentCreatedEmail = async (to, tournament, organizerName) => {
  try {
    const mailOptions = {
      from: `"BattleZone Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🏆 New Tournament: ${tournament.name} is Live!`,
      html: `
        <p>Hello,</p>
        <p>${organizerName} has created a new tournament: <strong>${tournament.name}</strong>.</p>
        <p>Game Type: ${tournament.game_type}<br>
        Entry Fee: ₹${tournament.entry_fee}<br>
        Prize Pool: ₹${tournament.prize_pool}<br>
        Start: ${new Date(tournament.start_datetime).toLocaleString()}<br>
        End: ${new Date(tournament.end_datetime).toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Tournament email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending tournament email:", err.message);
    throw new Error("Failed to send tournament email");
  }
};
