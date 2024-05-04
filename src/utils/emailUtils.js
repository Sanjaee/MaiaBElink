const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "bulk.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

module.exports = {
  sendVerificationEmail: async (email, username, verificationToken) => {
    const verifyLink = `${process.env.APP_URL}/verify/${verificationToken}`;
    const mailOptions = {
      from: "mailtrap@demomailtrap.com",
      to: email,
      subject: "Verify Your Email Address to Complete Registration",
      html: `
        <p>Hello ${username},</p>
        <p>Thank you for signing up with MAIA! We're thrilled to have you on board.</p>
        <p>To ensure the security of your account and access all the features, please verify your email address by clicking the link below:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>If you have trouble clicking the link, please copy and paste it into your browser's address bar.</p>
        <p>Once your email is verified, you'll be ready to dive into MAIA's exciting features.</p>
        <p>If you did not register with us, please ignore this email or contact our support team at support@maiadigital.id.</p>
        <p>Thank you for choosing MAIA!</p>
        <p>Best regards,<br>MAIA</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return verificationToken;
  },
};
