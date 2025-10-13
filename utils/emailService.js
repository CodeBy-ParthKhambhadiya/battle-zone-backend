import nodemailer from "nodemailer";

export const sendForgotPasswordEmail = async (to, newPassword, role = "USER") => {
  try {
    // ✅ Transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // helps avoid certain SSL errors on Gmail
      },
    });

    // ✅ Email Template
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔐 BattleZone Password Reset — ${role} Account Credentials`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px;">
          <div style="max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background-color: #1e293b; color: #ffffff; padding: 25px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">⚔️ BattleZone</h1>
              <p style="margin-top: 6px; font-size: 14px; opacity: 0.9;">${role.toUpperCase()} ACCOUNT PASSWORD RESET</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 35px; text-align: center;">
              <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 10px;">Password Reset Successful</h2>
              <p style="color: #475569; font-size: 16px; margin-top: 10px;">
                Your new temporary password has been generated securely.
              </p>
              
              <!-- Password Card -->
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 25px auto; display: inline-block;">
                <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; letter-spacing: 1px;">
                  🔑 ${newPassword}
                </p>
              </div>

              <p style="color: #475569; font-size: 15px; margin-top: 25px;">
                Please log in using this password and <strong>change it immediately</strong> for your account security.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; color: #94a3b8; font-size: 12px; text-align: center; padding: 15px;">
              <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
              <p>If you didn’t request this password reset, please contact our support team immediately.</p>
            </div>
          </div>
        </div>
      `,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${to} (${role})`);
  } catch (err) {
    console.error("❌ Error sending forgot password email:", err.message);
    throw new Error("Failed to send password reset email. Please try again later.");
  }
};



/**
 * Send OTP email to user
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP
 */
export const sendOTPEmail = async (to, otp) => {
  try {
    // 1️⃣ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2️⃣ Compose email
    const mailOptions = {
      from: `"BattleZone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔐 BattleZone OTP Verification",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px;">
          <div style="max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background-color: #1e293b; color: #ffffff; padding: 25px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px;">⚔️ BattleZone</h1>
            </div>
            
            <!-- Body -->
            <div style="padding: 35px; text-align: center;">
              <h2 style="color: #1e293b; font-size: 22px;">OTP Verification</h2>
              <p style="color: #475569; font-size: 16px; margin-top: 10px;">
                Your OTP for BattleZone registration is:
              </p>
              
              <!-- OTP Card -->
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px auto; display: inline-block;">
                <p style="font-size: 22px; font-weight: bold; color: #0f172a; margin: 0;">${otp}</p>
              </div>

              <p style="color: #475569; font-size: 15px; margin-top: 25px;">
                This OTP is valid for 10 minutes. Do not share it with anyone.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; color: #94a3b8; font-size: 12px; text-align: center; padding: 15px;">
              <p>© ${new Date().getFullYear()} <strong>BattleZone</strong>. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    // 3️⃣ Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully to:", to);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
    throw new Error("Failed to send OTP email");
  }
};
