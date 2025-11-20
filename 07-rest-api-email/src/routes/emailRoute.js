import express from "express";
import { 
  sendWelcomeEmail,
  sendBulkNotification,
  verifyEmailConfiguration
} from "../controllers/userController.js";

const emailRouter = express.Router();

// Send welcome email
emailRouter.post("/email/welcome", sendWelcomeEmail);

// Send bulk notifications
emailRouter.post("/email/bulk", sendBulkNotification);

// Verify email configuration
emailRouter.get("/email/verify", verifyEmailConfiguration);

export default emailRouter;