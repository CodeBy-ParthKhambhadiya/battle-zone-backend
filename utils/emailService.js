// utils/emailService.js
import nodemailer from "nodemailer";

// 1️⃣ Create a reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail app password
  },
  tls: {
    rejectUnauthorized: false, // necessary on some cloud hosts
  },
});

// 2️⃣ Optional: verify connection (run at startup)
transporter.verify()
  .then(() => console.log("✅ SMTP server is ready to send emails"))
  .catch(err => console.error("❌ SMTP connection failed:", err));

// 3️⃣ Send Forgot Password Email
export const sendForgotPasswordEmail = async (to, newPassword, role = "USER") => {
  try {
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔐 BattleZone Password Reset — ${role} Account Credentials`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 30px;">
          <div style="max-width:600px; margin:auto; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">
            <div style="background-color:#1e293b; color:#fff; padding:25px; text-align:center;">
              <h1>⚔️ BattleZone</h1>
              <p style="opacity:0.9;">${role.toUpperCase()} ACCOUNT PASSWORD RESET</p>
            </div>
            <div style="padding:35px; text-align:center;">
              <h2>Password Reset Successful</h2>
              <p>Your new temporary password has been generated securely.</p>
              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:20px; margin:25px auto; display:inline-block;">
                <p style="font-size:18px; font-weight:bold; color:#0f172a;">🔑 ${newPassword}</p>
              </div>
              <p>Please log in using this password and <strong>change it immediately</strong>.</p>
            </div>
            <div style="background-color:#f1f5f9; color:#94a3b8; font-size:12px; text-align:center; padding:15px;">
              <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
              <p>If you didn’t request this, contact support immediately.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${to} (${role})`);
  } catch (err) {
    console.error("❌ Error sending forgot password email:", err.message);
    throw new Error("Failed to send password reset email. Please try again later.");
  }
};

// 4️⃣ Send OTP Email
export const sendOTPEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔐 BattleZone OTP Verification",
      html: `
        <div style="font-family:'Segoe UI', sans-serif; padding:30px;">
          <div style="max-width:600px; margin:auto; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">
            <div style="background-color:#1e293b; color:#fff; padding:25px; text-align:center;">
              <h1>⚔️ BattleZone</h1>
            </div>
            <div style="padding:35px; text-align:center;">
              <h2>OTP Verification</h2>
              <p>Your OTP for BattleZone registration is:</p>
              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:20px; margin:20px auto; display:inline-block;">
                <p style="font-size:22px; font-weight:bold; color:#0f172a;">${otp}</p>
              </div>
              <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
            </div>
            <div style="background-color:#f1f5f9; color:#94a3b8; font-size:12px; text-align:center; padding:15px;">
              <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to: ${to}`);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
    throw new Error("Failed to send OTP email");
  }
};

// 5️⃣ Send Tournament Created Email
export const sendTournamentCreatedEmail = async (to, tournament, organizerName) => {
  try {
    const mailOptions = {
      from: `"BattleZone Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🏆 New Tournament: ${tournament.name} is Live!`,
      html: `
        <div style="font-family:'Segoe UI', sans-serif; background:#f8fafc; padding:30px;">
          <div style="max-width:650px; margin:auto; border-radius:14px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); background:#fff;">
            <div style="background-color:#1e293b; color:#fff; padding:30px 20px; text-align:center;">
              <h1>⚔️ BattleZone</h1>
              <p>The Ultimate Competitive Arena</p>
            </div>
            <div style="padding:40px 30px; text-align:center;">
              <h2>A New Tournament Awaits!</h2>
              <p><strong>${organizerName}</strong> has created a new tournament on <strong>BattleZone</strong>.</p>
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:30px 35px; margin:0 auto 25px; max-width:520px; text-align:left; line-height:1.6;">
                <h3 style="text-align:center; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">🏆 Tournament Details</h3>
                <p><strong>Name:</strong> ${tournament.name}</p>
                <p><strong>Game Type:</strong> ${tournament.game_type}</p>
                <p><strong>Entry Fee:</strong> ₹${tournament.entry_fee}</p>
                <p><strong>Prize Pool:</strong> ₹${tournament.prize_pool}</p>
                <p><strong>Start:</strong> ${new Date(tournament.start_datetime).toLocaleString()}</p>
                <p><strong>End:</strong> ${new Date(tournament.end_datetime).toLocaleString()}</p>
              </div>
              <p>Don’t miss out — spots fill up fast!</p>
            </div>
            <div style="background-color:#f1f5f9; color:#94a3b8; font-size:12px; text-align:center; padding:18px;">
              <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Tournament creation email sent to: ${to}`);
  } catch (err) {
    console.error("❌ Error sending tournament email:", err.message);
    throw new Error("Failed to send tournament email");
  }
};
