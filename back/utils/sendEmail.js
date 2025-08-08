const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Check if email credentials are configured
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    process.env.EMAIL_PASSWORD === "your_app_password_here" ||
    process.env.EMAIL_USER.trim() === "" ||
    process.env.EMAIL_PASSWORD.trim() === ""
  ) {
    throw new Error(
      "Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in config.env"
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOpts = {
    from: `E-shop App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.sendMail(mailOpts);
    console.log("✅ Email sent successfully to:", options.email);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
