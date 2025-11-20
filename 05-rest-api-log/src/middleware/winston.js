import winston from "winston";
import "winston-daily-rotate-file";
import Log from "../models/logModel.js";

const transport = new winston.transports.DailyRotateFile({
  filename: "./logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "1m",
  maxFiles: "14d",
  level: "error",
  handleExceptions: true,
});

const logger = winston.createLogger({
  level: "silly",
  format: winston.format.combine(
    winston.format.json({ space: 2 }),
    winston.format.timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    winston.format.label({ label: "[LOGGER]" }),
    winston.format.printf(
      (info) =>
        ` ${info.label} ${info.timestamp} ${info.level} : ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      level: "silly",
      handleExceptions: true,
      format: winston.format.combine(winston.format.colorize({ all: true })),
    }),
    transport,
  ],
});

// Middleware to log HTTP requests
export const logHttpRequest = async (req, res, next) => {
  // Capture the original send function to log response details
  const originalSend = res.send;
  let responseBody = {};
  
  res.send = function(data) {
    try {
      responseBody = JSON.parse(data);
    } catch (e) {
      responseBody = data;
    }
    return originalSend.call(this, data);
  };
  
  // Log request details after response is sent
  res.on('finish', async () => {
    try {
      // Extract IP address
      const ipAddress = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress ||
                       (req.connection.socket ? req.connection.socket.remoteAddress : null);
      
      // Extract user agent
      const userAgent = req.headers['user-agent'];
      
      // Extract user ID from request if available
      const userId = req.user ? req.user.userId : null;
      
      // Create log entry
      await Log.createLog(
        userId,
        `${req.method} ${req.originalUrl}`,
        `Status: ${res.statusCode} - Response: ${JSON.stringify(responseBody).substring(0, 200)}`,
        ipAddress,
        userAgent,
        res.statusCode
      );
    } catch (error) {
      console.error('Failed to log HTTP request:', error.message);
    }
  });
  
  next();
};

export default logger;
