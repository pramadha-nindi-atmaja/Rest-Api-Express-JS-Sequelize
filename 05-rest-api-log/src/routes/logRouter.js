import express from "express";
import { 
  getLogs,
  getLogById,
  searchLogs,
  getLogStats,
  deleteLog
} from "../controllers/logController.js";

const logRouter = express.Router();

logRouter.get("/logs", getLogs);
logRouter.get("/logs/:id", getLogById);
logRouter.get("/logs/search", searchLogs);
logRouter.get("/logs/stats", getLogStats);
logRouter.delete("/logs/:id", deleteLog);

export default logRouter;