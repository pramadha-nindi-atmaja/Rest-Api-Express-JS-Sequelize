import nodemailer from "nodemailer";
import "dotenv/config";
const base_url = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Email template for account activation
const createActivationEmail = (email, token) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Account Activation - Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our Service!</h2>
        <p>Thank you for registering with us. To activate your account, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${base_url}/api/users/activate/${token}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Activate Account
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${base_url}/api/users/activate/${token}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This activation link will expire in 1 hour. If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
  };
};

// Email template for password reset
const createPasswordResetEmail = (email, token) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${base_url}/api/users/reset-password/${token}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${base_url}/api/users/reset-password/${token}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This reset link will expire in 1 hour. If you didn't request this reset, please ignore this email.
        </p>
      </div>
    `,
  };
};

// Email template for welcome message
const createWelcomeEmail = (email, name) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: `Welcome ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our Service, ${name}!</h2>
        <p>We're excited to have you on board. Here are some things you can do with your new account:</p>
        <ul>
          <li>Access all premium features</li>
          <li>Connect with other users</li>
          <li>Get personalized recommendations</li>
          <li>24/7 customer support</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br/>The Team</p>
      </div>
    `,
  };
};

// Email template for notification
const createNotificationEmail = (email, subject, message) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>${message}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          You received this email because you are subscribed to our notifications.
          <a href="${base_url}/unsubscribe">Unsubscribe</a>
        </p>
      </div>
    `,
  };
};

// Generic email sender function
const sendMail = async (email, token, templateType = 'activation') => {
  try {
    let mailOptions;
    
    switch (templateType) {
      case 'activation':
        mailOptions = createActivationEmail(email, token);
        break;
      case 'passwordReset':
        mailOptions = createPasswordResetEmail(email, token);
        break;
      case 'welcome':
        mailOptions = createWelcomeEmail(email, token); // token parameter used as name
        break;
      case 'notification':
        mailOptions = createNotificationEmail(email, token.subject, token.message); // token parameter used as object
        break;
      default:
        mailOptions = createActivationEmail(email, token);
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Email sending failed: " + error.message);
    return { success: false, error: error.message };
  }
};

// Function to send bulk emails
const sendBulkMail = async (recipients, subject, message) => {
  try {
    const results = [];
    
    for (const recipient of recipients) {
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: recipient.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subject}</h2>
            <p>Hello ${recipient.name},</p>
            <p>${message}</p>
            <p>Best regards,<br/>The Team</p>
          </div>
        `,
      };
      
      try {
        const info = await transporter.sendMail(mailOptions);
        results.push({ email: recipient.email, success: true, messageId: info.messageId });
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.log("Bulk email sending failed: " + error.message);
    throw error;
  }
};

// Function to verify email configuration
const verifyEmailConfig = async () => {
  try {
    const result = await transporter.verify();
    console.log('Email server is ready to send messages');
    return { success: true, message: 'Email server is ready' };
  } catch (error) {
    console.log('Email server verification failed: ' + error.message);
    return { success: false, error: error.message };
  }
};

export { sendMail, sendBulkMail, verifyEmailConfig };
