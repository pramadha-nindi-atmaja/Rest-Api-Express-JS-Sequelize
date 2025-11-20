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
Log.createLog = async function(userId, action, description, ipAddress = null, userAgent = null) {
  return await Log.create({
    userId,
    action,
    description,
    ipAddress,
    userAgent
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

// Added function to test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error.message);
  });

// Sync Log model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Log model synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing the Log model:", error.message);
  });

export default Log;