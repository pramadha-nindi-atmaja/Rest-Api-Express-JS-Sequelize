import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import { encript } from "../utils/bcrypt.js";
import moment from "moment";

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

sequelize.sync();

// Add a method to search users
User.search = async function(query) {
  return await User.findAll({
    where: {
      [Sequelize.Op.or]: [
        { name: { [Sequelize.Op.like]: `%${query}%` } },
        { email: { [Sequelize.Op.like]: `%${query}%` } },
      ],
    },
  });
};

// Add a method to get user statistics
User.getStats = async function() {
  const totalUsers = await User.count();
  
  const activeUsers = await User.count({
    where: { isActive: true }
  });
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers
  };
};

// Add a method to get users with pagination
User.paginate = async function(page = 1, limit = 10, filters = {}) {
  const offset = (page - 1) * limit;
  
  // Build where clause from filters
  const whereClause = {};
  if (filters.search) {
    whereClause[Sequelize.Op.or] = [
      { name: { [Sequelize.Op.like]: `%${filters.search}%` } },
      { email: { [Sequelize.Op.like]: `%${filters.search}%` } },
    ];
  }
  
  const result = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password'] },
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });
  
  const totalPages = Math.ceil(result.count / limit);
  
  return {
    users: result.rows,
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

// Add a method to update user password
User.updatePassword = async function(userId, newPassword) {
  const user = await User.findOne({ where: { userId: userId } });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  user.password = newPassword;
  await user.save();
  
  // Return user without password
  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

export default User;
