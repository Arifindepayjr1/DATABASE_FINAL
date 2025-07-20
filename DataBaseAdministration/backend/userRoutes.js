import express from "express";
import userController from "../backend/controllers/userControllers.js";

const userRouter = express.Router();

userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", userController.getOneUser);
userRouter.post("/", userController.createUser);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
userRouter.post("/assign-roles", userController.assignRoles);
userRouter.post("/clear-roles", userController.clearUserRoles);

export default userRouter;