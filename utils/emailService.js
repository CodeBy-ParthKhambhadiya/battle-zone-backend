// utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter for Gmail (Live server)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       // Your Gmail email
    pass: process.env.EMAIL_PASS,       // Gmail App Password (not regular password)
  },
});

// ----------------------------
// 1️⃣ Forgot Password Email
// ----------------------------
export const sendForgotPasswordEmail = async (to, newPassword, role = "USER") => {
  try {
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `🔐 BattleZone Password Reset — ${role} Account Credentials`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 30px;">
          <div style="max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="background-color: #1e293b; color: #ffffff; padding: 25px; text-align: center;">
              <h1 style="margin:0; font-size:26px;">⚔️ BattleZone</h1>
              <p style="margin-top:6px; font-size:14px; opacity:0.9;">${role.toUpperCase()} ACCOUNT PASSWORD RESET</p>
            </div>
            <div style="padding:35px; text-align:center;">
              <h2 style="color:#1e293b; font-size:22px; margin-bottom:10px;">Password Reset Successful</h2>
              <p style="color:#475569; font-size:16px;">Your new temporary password has been generated securely.</p>
              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:20px; margin:25px auto; display:inline-block;">
                <p style="font-size:18px; font-weight:bold; color:#0f172a; margin:0;">🔑 ${newPassword}</p>
              </div>
              <p style="color:#475569; font-size:15px; margin-top:25px;">Please log in using this password and <strong>change it immediately</strong>.</p>
            </div>
            <div style="background-color:#f1f5f9; color:#94a3b8; font-size:12px; text-align:center; padding:15px;">
              <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${to}`);
  } catch (err) {
    console.error("❌ Error sending forgot password email:", err.message);
    throw new Error("Failed to send password reset email.");
  }
};

// ----------------------------
// 2️⃣ OTP Email
// ----------------------------
// export const sendOTPEmail = async (to, otp) => {
//   try {
//     const mailOptions = {
//       from: `"BattleZone Support" <${process.env.EMAIL_FROM}>`,
//       to,
//       subject: "🔐 BattleZone OTP Verification",
//       html: `
//         <div style="font-family: 'Segoe UI', sans-serif; padding: 30px;">
//           <div style="max-width:600px; margin:auto; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
//             <div style="background-color:#1e293b; color:#ffffff; padding:25px; text-align:center;">
//               <h1 style="margin:0; font-size:26px;">⚔️ BattleZone</h1>
//             </div>
//             <div style="padding:35px; text-align:center;">
//               <h2 style="color:#1e293b; font-size:22px;">OTP Verification</h2>
//               <p style="color:#475569; font-size:16px;">Your OTP for BattleZone registration is:</p>
//               <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:20px; margin:20px auto; display:inline-block;">
//                 <p style="font-size:22px; font-weight:bold; color:#0f172a; margin:0;">${otp}</p>
//               </div>
//               <p style="color:#475569; font-size:15px; margin-top:25px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
//             </div>
//             <div style="background-color:#f1f5f9; color:#94a3b8; font-size:12px; text-align:center; padding:15px;">
//               <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
//             </div>
//           </div>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`✅ OTP email sent to ${to}`);
//   } catch (err) {
//     console.error("❌ Error sending OTP email:", err.message);
//     throw new Error("Failed to send OTP email.");
//   }
// };

// ----------------------------
// 3️⃣ Tournament Created Email
// ----------------------------

export const sendTournamentCreatedEmail = async (to, tournament, organizerName) => {
  try {
    const mailOptions = {
      from: `"BattleZone Notifications" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `🏆 New Tournament: ${tournament.name} is Live!`,
      html: `
        <div style="font-family:'Segoe UI', sans-serif; background-color:#f8fafc; padding:30px;">
          <div style="max-width:650px; margin:auto; border-radius:14px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); background-color:#ffffff;">
            <div style="background-color:#1e293b; color:#ffffff; padding:30px 20px; text-align:center;">
              <h1 style="margin:0; font-size:28px;">⚔️ BattleZone</h1>
              <p style="margin:8px 0 0; font-size:15px; color:#cbd5e1;">The Ultimate Competitive Arena</p>
            </div>
            <div style="padding:40px 30px; text-align:center;">
              <h2 style="color:#0f172a; font-size:24px; margin-bottom:10px;">A New Tournament Awaits!</h2>
              <p style="color:#475569; font-size:16px; margin:0 0 20px;">
                <strong>${organizerName}</strong> has just created a brand new tournament on <strong>BattleZone</strong>.
              </p>
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:30px 35px; margin:0 auto 25px; max-width:520px; text-align:left; line-height:1.6;">
                <h3 style="margin:0 0 20px; color:#0f172a; font-size:20px; text-align:center; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">
                  🏆 <span style="color:#2563eb;">Tournament Details</span>
                </h3>
                <p style="margin:10px 0; font-size:17px; color:#1e293b;">
                  <strong style="color:#2563eb;">Name:</strong> <span style="font-weight:600; color:#0f172a;">${tournament.name}</span>
                </p>
                <p style="margin:10px 0; font-size:17px; color:#1e293b;">
                  <strong style="color:#2563eb;">Game Type:</strong> <span style="font-weight:600; color:#0f172a;">${tournament.game_type}</span>
                </p>
                <p style="margin:10px 0; font-size:17px; color:#1e293b;">
                  <strong style="color:#2563eb;">Entry Fee:</strong> <span style="font-weight:700; color:#16a34a;">₹${tournament.entry_fee}</span>
                </p>
                <p style="margin:10px 0; font-size:17px; color:#1e293b;">
                  <strong style="color:#2563eb;">Prize Pool:</strong> <span style="font-weight:700; color:#dc2626;">₹${tournament.prize_pool}</span>
                </p>
                <p style="margin:10px 0; font-size:17px; color:#1e293b;">
                  <strong style="color:#2563eb;">Start:</strong> <span style="font-weight:600; color:#0f172a;">${new Date(tournament.start_datetime).toLocaleString()}</span>
                </p>
                <p style="margin:10px 0; font-size:17px; color:#1e293b;">
                  <strong style="color:#2563eb;">End:</strong> <span style="font-weight:600; color:#0f172a;">${new Date(tournament.end_datetime).toLocaleString()}</span>
                </p>
              </div>
              <p style="color:#64748b; font-size:14px; margin-top:25px;">Don’t miss out — spots fill up fast!</p>
            </div>
            <div style="background-color:#f1f5f9; color:#94a3b8; font-size:12px; text-align:center; padding:18px;">
              <p style="margin:0;">© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Tournament email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending tournament email:", err.message);
    throw new Error("Failed to send tournament email");
  }
};


import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Your OTP Code - Battle Zone",
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>🔐 Verify Your Email</h2>
        <p>Your OTP is:</p>
        <h1 style="color:#007BFF;">${otp}</h1>
        <p>Expires in 2 minutes.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error("❌ SendGrid Error:", error.message);

    if (error.response) {
      console.error("SendGrid Response:", error.response.body);
    }

    throw new Error("Failed to send OTP email");
  }
};

