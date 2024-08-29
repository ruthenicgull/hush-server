import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use appropriate service for your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, verificationCode) => {
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333333;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #dddddd;
            }
            .header img {
                max-width: 120px;
            }
            .content {
                padding: 30px;
                text-align: center;
            }
            .content h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                color: #555555;
                margin-bottom: 30px;
            }
            .code {
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
                padding: 15px;
                border-radius: 5px;
                background-color: #f9f9f9;
                display: inline-block;
                letter-spacing: 4px;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #dddddd;
                font-size: 12px;
                color: #999999;
            }
            .footer a {
                color: #4CAF50;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <h1>Email Verification</h1>
                <p>Thank you for registering!</p>
                <p>Please use the following code to verify your email address:</p>
                <div class="code">${verificationCode}</div>
                <p>This code will expire in 1 hour.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
                <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Please verify your email address",
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
