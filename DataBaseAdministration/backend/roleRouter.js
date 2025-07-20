import express from "express";
import roleController from "../backend/controllers/roleController.js";
const roleRouter = express.Router();

roleRouter.get("/" , roleController.getAllRoles);
roleRouter.post("/" , roleController.createRoles);
roleRouter.put("/:id" , roleController.updateRoles);
roleRouter.delete("/:id" , roleController.deleteRoles);
roleRouter.get("/:id", roleController.getOneRoles);

export default roleRouter;