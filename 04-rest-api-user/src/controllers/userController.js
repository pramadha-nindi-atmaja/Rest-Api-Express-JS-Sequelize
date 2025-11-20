import sequelize from "../utils/db.js";
import User from "../models/userModel.js";
import { Sequelize } from "sequelize";
const setUser = async (req, res, next) => {
  try {
    const t = await sequelize.transaction();
    const user = req.body;
    const newUser = await User.create(
      {
        ...user,
        expireTime: new Date(),
      },
      {
        transaction: t,
      }
    );
    await t.commit();
    res.status(201).json({
      errors: null,
      message: "User created successfully",
      data: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        expireTime: newUser.expireTime,
      },
    });
  } catch (error) {
    next(new Error("controllers/userController.js:setUser: " + error.message));
  }
};

const getUser = async (req, res, next) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get search filter if provided
    const { search } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.like]: `%${search}%` } },
        { email: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    
    // Get users with pagination
    const result = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] }, // Exclude password from results
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(result.count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      errors: null,
      message: "Users retrieved successfully",
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: result.count,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        limit: limit,
      }
    });
  } catch (error) {
    next(new Error("controllers/userController.js:getUser: " + error.message));
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { userId: id },
      attributes: { exclude: ['password'] } // Exclude password from results
    });
    
    if (!user) {
      return res.status(404).json({
        errors: ["User not found"],
        message: "Get user failed",
        data: null,
      });
    }
    
    res.status(200).json({
      errors: null,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:getUserById: " + error.message));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const user = await User.findOne({ where: { userId: id } });
    
    if (!user) {
      return res.status(404).json({
        errors: ["User not found"],
        message: "Update user failed",
        data: null,
      });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = user.toJSON();
    
    res.status(200).json({
      errors: null,
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:updateUser: " + error.message));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({ where: { userId: id } });
    
    if (!user) {
      return res.status(404).json({
        errors: ["User not found"],
        message: "Delete user failed",
        data: null,
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      errors: null,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:deleteUser: " + error.message));
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        errors: ["Query parameter is required"],
        message: "Search user failed",
        data: null,
      });
    }
    
    const users = await User.findAll({
      where: {
        [Sequelize.Op.or]: [
          { name: { [Sequelize.Op.like]: `%${query}%` } },
          { email: { [Sequelize.Op.like]: `%${query}%` } },
        ],
      },
      attributes: { exclude: ['password'] } // Exclude password from results
    });
    
    res.status(200).json({
      errors: null,
      message: "Users searched successfully",
      data: users,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:searchUsers: " + error.message));
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    
    const activeUsers = await User.count({
      where: { isActive: true }
    });
    
    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers
    };
    
    res.status(200).json({
      errors: null,
      message: "User statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(new Error("controllers/userController.js:getUserStats: " + error.message));
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        errors: ["Password is required"],
        message: "Update password failed",
        data: null,
      });
    }
    
    const updatedUser = await User.updatePassword(id, password);
    
    res.status(200).json({
      errors: null,
      message: "User password updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        errors: ["User not found"],
        message: "Update password failed",
        data: null,
      });
    }
    next(new Error("controllers/userController.js:updateUserPassword: " + error.message));
  }
};

export { setUser, getUser, getUserById, updateUser, deleteUser, searchUsers, getUserStats, updateUserPassword };
