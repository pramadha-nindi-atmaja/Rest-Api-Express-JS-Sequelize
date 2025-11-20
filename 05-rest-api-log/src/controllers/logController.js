import Log from "../models/logModel.js";
import { Sequelize } from "sequelize";

const getLogs = async (req, res, next) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get filters from query
    const { userId, action, statusCode } = req.query;
    const filters = {};
    
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (statusCode) filters.statusCode = parseInt(statusCode);
    
    const result = await Log.paginate(page, limit, filters);
    
    res.status(200).json({
      errors: null,
      message: "Logs retrieved successfully",
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    next(new Error("controllers/logController.js:getLogs - " + error.message));
  }
};

const getLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const log = await Log.findOne({
      where: { logId: id },
      include: [{
        model: Log.sequelize.models.User,
        attributes: ['userId', 'name', 'email']
      }]
    });
    
    if (!log) {
      return res.status(404).json({
        errors: ["Log not found"],
        message: "Get log failed",
        data: null,
      });
    }
    
    res.status(200).json({
      errors: null,
      message: "Log retrieved successfully",
      data: log,
    });
  } catch (error) {
    next(new Error("controllers/logController.js:getLogById - " + error.message));
  }
};

const searchLogs = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        errors: ["Query parameter is required"],
        message: "Search logs failed",
        data: null,
      });
    }
    
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Log.search(query, page, limit);
    
    res.status(200).json({
      errors: null,
      message: "Logs searched successfully",
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    next(new Error("controllers/logController.js:searchLogs - " + error.message));
  }
};

const getLogStats = async (req, res, next) => {
  try {
    const stats = await Log.getStats();
    
    res.status(200).json({
      errors: null,
      message: "Log statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(new Error("controllers/logController.js:getLogStats - " + error.message));
  }
};

const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const log = await Log.findOne({ where: { logId: id } });
    
    if (!log) {
      return res.status(404).json({
        errors: ["Log not found"],
        message: "Delete log failed",
        data: null,
      });
    }
    
    await log.destroy();
    
    res.status(200).json({
      errors: null,
      message: "Log deleted successfully",
      data: null,
    });
  } catch (error) {
    next(new Error("controllers/logController.js:deleteLog - " + error.message));
  }
};

export { getLogs, getLogById, searchLogs, getLogStats, deleteLog };