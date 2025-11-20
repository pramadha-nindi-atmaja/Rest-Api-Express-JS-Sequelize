import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./userModel.js";

// Define Log model
const Log = sequelize.define(
  "Log",
  {
    logId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'userId'
      }
    },
    action: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    ipAddress: {
      type: Sequelize.STRING,
    },
    userAgent: {
      type: Sequelize.STRING,
    },
    statusCode: {
      type: Sequelize.INTEGER,
    },
  },
  {
    tableName: "log",
    underscored: true,
    timestamps: true,
  }
);

// Relationship between User and Log
User.hasMany(Log, {
  foreignKey: "userId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Log.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Add a method to create a log entry
Log.createLog = async function(userId, action, description, ipAddress = null, userAgent = null, statusCode = null) {
  return await Log.create({
    userId,
    action,
    description,
    ipAddress,
    userAgent,
    statusCode
  });
};

// Add a method to get logs with pagination
Log.paginate = async function(page = 1, limit = 10, filters = {}) {
  const offset = (page - 1) * limit;
  
  // Build where clause from filters
  const whereClause = {};
  if (filters.userId) {
    whereClause.userId = filters.userId;
  }
  if (filters.action) {
    whereClause.action = filters.action;
  }
  if (filters.statusCode) {
    whereClause.statusCode = filters.statusCode;
  }
  
  const result = await Log.findAndCountAll({
    where: whereClause,
    include: [{
      model: User,
      attributes: ['userId', 'name', 'email']
    }],
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });
  
  const totalPages = Math.ceil(result.count / limit);
  
  return {
    logs: result.rows,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalCount: result.count,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit: limit,
    }
  };
};

// Add a method to search logs
Log.search = async function(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const result = await Log.findAndCountAll({
    where: {
      [Sequelize.Op.or]: [
        { action: { [Sequelize.Op.like]: `%${query}%` } },
        { description: { [Sequelize.Op.like]: `%${query}%` } },
      ],
    },
    include: [{
      model: User,
      attributes: ['userId', 'name', 'email']
    }],
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });
  
  const totalPages = Math.ceil(result.count / limit);
  
  return {
    logs: result.rows,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalCount: result.count,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit: limit,
    }
  };
};

// Add a method to get log statistics
Log.getStats = async function() {
  const totalLogs = await Log.count();
  
  const logsByAction = await Log.findAll({
    attributes: [
      'action',
      [sequelize.fn('COUNT', sequelize.col('action')), 'count']
    ],
    group: ['action']
  });
  
  const logsByStatus = await Log.findAll({
    attributes: [
      'statusCode',
      [sequelize.fn('COUNT', sequelize.col('statusCode')), 'count']
    ],
    group: ['statusCode']
  });
  
  return {
    totalLogs,
    logsByAction: logsByAction.map(item => ({
      action: item.action,
      count: item.get('count')
    })),
    logsByStatus: logsByStatus.map(item => ({
      statusCode: item.statusCode,
      count: item.get('count')
    }))
  };
};

sequelize.sync();

export default Log;