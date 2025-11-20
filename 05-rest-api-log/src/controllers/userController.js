import sequelize from "../utils/db.js";
import User from "../models/userModel.js";
import Log from "../models/logModel.js";
const setUser = async (req, res, next) => {
  try {
    const t = await sequelize.transaction();
    const user = req.body;
    const userExists = await User.findAll({
      where: {
        email: user.email,
      },
    });
    if (userExists.length > 0 && userExists[0].isActive) {
      // Log the attempt
      await Log.createLog(
        null,
        "USER_REGISTER",
        "Failed to register user - Email already activated",
        req.ip,
        req.headers['user-agent'],
        400
      );
      
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
      // Log the attempt
      await Log.createLog(
        null,
        "USER_REGISTER",
        "Failed to register user - Email already registered, please check your email",
        req.ip,
        req.headers['user-agent'],
        400
      );
      
      return res.status(400).json({
        errors: ["Email already registered, please check your email"],
        message: "Register Field",
        data: null,
      });
    } else {
      User.destroy({
        where: {
          email: user.email,
        },
      });
    }
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
    
    // Log successful registration
    await Log.createLog(
      newUser.userId,
      "USER_REGISTER",
      "User registered successfully",
      req.ip,
      req.headers['user-agent'],
      201
    );
    
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
    // Log the error
    await Log.createLog(
      null,
      "USER_REGISTER_ERROR",
      `Error registering user: ${error.message}`,
      req.ip,
      req.headers['user-agent'],
      500
    );
    
    next(new Error("controllers/userController.js:setUser - " + error.message));
  }
};

export { setUser };
