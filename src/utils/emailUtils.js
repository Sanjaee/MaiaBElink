import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporterNodeMailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendVerificationEmail = async (
  email,
  username,
  verificationToken
) => {
  const verifyLink = `${process.env.BASE_URL}/verify/${verificationToken}`;
  const mailOptions = {
    from: `"MAIA Support" <${process.env.EMAIL_USER}>`, // Add the name here
    to: email,
    subject: "Verify Your Email Address to Complete Registration",
    html: `
       <p>Hello ${username},</p>
       <p>Thank you for signing up with MAIA! We're thrilled to have you on board.</p>
       <p>To ensure the security of your account and access all the features, please verify your email address by clicking the button below:</p>
       <p style="text-align: center;">
         <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #336FF9; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
       </p>
       <p>Once your email is verified, you'll be ready to dive into MAIA's exciting features.</p>
       <p>If you did not register with us, please ignore this email or contact our support team at support@maiadigital.id.</p>
       <p>Thank you for choosing MAIA!</p>
       <p>Best regards,<br>MAIA</p>
      `,
  };

  await transporterNodeMailer.sendMail(mailOptions);
  return verificationToken;
};
