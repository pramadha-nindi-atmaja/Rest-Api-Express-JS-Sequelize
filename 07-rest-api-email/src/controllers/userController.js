import sequelize from "../utils/db.js";
import { dataValid } from "../validation/dataValidation.js";
import { sendMail, sendBulkMail, verifyEmailConfig } from "../utils/sendMail.js";
import User from "../models/userModel.js";
const setUser = async (req, res, next) => {
  const t = await sequelize.transaction();
  const valid = {
    name: "required",
    email: "required,isEmail",
    password: "required,isStrongPassword",
  };
  try {
    // const user = req.body;
    const user = await dataValid(valid, req.body);
    if (user.message.length > 0) {
      return res.status(400).json({
        errors: user.message,
        message: "Register Field",
        data: null,
      });
    }
    const userExists = await User.findAll({
      where: {
        email: user.data.email,
      },
    });
    if (userExists.length > 0 && userExists[0].isActive) {
      return res.status(400).json({
        errors: ["Email already activated"],
        message: "Register Field",
        data: null,
      });
    } else if (
      userExists.length > 0 &&
      !userExists[0].isActive &&
      Date.parse(userExists[0].expireTime) > new Date()
    ) {
      return res.status(400).json({
        errors: ["Email already registered, please check your email"],
        message: "Register Field",
        data: null,
      });
    } else {
      User.destroy(
        {
          where: {
            email: user.data.email,
          },
        },
        {
          transaction: t,
        }
      );
    }
    const newUser = await User.create(
      {
        ...user.data,
        expireTime: new Date(),
      },
      {
        transaction: t,
      }
    );
    const result = await sendMail(newUser.email, newUser.userId, 'activation');
    if (!result.success) {
      await t.rollback();
      return res.status(500).json({
        errors: ["Send email failed: " + result.error],
        message: "Register Field",
        data: null,
      });
    } else {
      await t.commit();
      res.status(201).json({
        errors: null,
        message: "User created, please check your email",
        data: {
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          expireTime: newUser.expireTime,
        },
      });
    }
  } catch (error) {
    await t.rollback();
    next(new Error("controllers/userController.js:setUser - " + error.message));
  }
};

const sendWelcomeEmail = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        errors: ["Email and name are required"],
        message: "Send Welcome Email Failed",
        data: null,
      });
    }
    
    const result = await sendMail(email, name, 'welcome');
    
    if (!result.success) {
      return res.status(500).json({
        errors: ["Failed to send welcome email: " + result.error],
        message: "Send Welcome Email Failed",
        data: null,
      });
    }
    
    res.status(200).json({
      errors: null,
      message: "Welcome email sent successfully",
      data: { email, name },
    });
  } catch (error) {
    next(new Error("controllers/userController.js:sendWelcomeEmail - " + error.message));
  }
};

const sendBulkNotification = async (req, res, next) => {
  try {
    const { recipients, subject, message } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || !subject || !message) {
      return res.status(400).json({
        errors: ["Recipients (array), subject, and message are required"],
        message: "Send Bulk Notification Failed",
        data: null,
      });
    }
    
    const results = await sendBulkMail(recipients, subject, message);
    
    res.status(200).json({
      errors: null,
      message: `Bulk email sent to ${results.length} recipients`,
      data: results,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:sendBulkNotification - " + error.message));
  }
};

const verifyEmailConfiguration = async (req, res, next) => {
  try {
    const result = await verifyEmailConfig();
    
    if (!result.success) {
      return res.status(500).json({
        errors: ["Email configuration verification failed: " + result.error],
        message: "Email Configuration Verification Failed",
        data: null,
      });
    }
    
    res.status(200).json({
      errors: null,
      message: "Email configuration verified successfully",
      data: result,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:verifyEmailConfiguration - " + error.message));
  }
};

export { setUser, sendWelcomeEmail, sendBulkNotification, verifyEmailConfiguration };
