import express from "express";
import { 
  setUser,
  getUser,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getUserStats,
  updateUserPassword
} from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/users", setUser);
userRouter.get("/users", getUser);
userRouter.get("/users/:id", getUserById);
userRouter.put("/users/:id", updateUser);
userRouter.delete("/users/:id", deleteUser);
userRouter.get("/users/search", searchUsers);
userRouter.get("/users/stats", getUserStats);
userRouter.put("/users/:id/password", updateUserPassword);

export default userRouter;
