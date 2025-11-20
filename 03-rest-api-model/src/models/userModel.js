import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import { encript } from "../utils/bcrypt.js";
import moment from "moment";

// Define User model
const User = sequelize.define(
  "User",
  {
    userId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensure the name is not empty
        len: [3, 50], // Set a length constraint between 3 and 50 characters
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("password", encript(value));
      },
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    expireTime: {
      type: Sequelize.DATE,
      set(value) {
        if (value !== null) {
          this.setDataValue("expireTime", moment(value).add(1, "hours"));
        } else {
          this.setDataValue("expireTime", null);
        }
      },
    },
  },
  {
    tableName: "user",
    underscored: true,
    timestamps: true,
  }
);

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error.message);
  });

// Sync the User model with the database
sequelize
  .sync()
  .then(() => {
    console.log("User model synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing the User model:", error.message);
  });

// Add a method to get user statistics
User.getStats = async function() {
  const totalUsers = await User.count();
  
  const activeUsers = await User.count({
    where: {
      isActive: true
    }
  });
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers
  };
};

export default User;