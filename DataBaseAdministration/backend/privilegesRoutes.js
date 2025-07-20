import express from "express";
import privilegesController from "./controllers/privilegesController.js";

const privilegesRouter = express.Router();

privilegesRouter.get("/", privilegesController.getAllPrivileges);
privilegesRouter.get("/tables", privilegesController.getAllTables);
privilegesRouter.get("/:id", privilegesController.getOnePrivilege);
privilegesRouter.post("/", privilegesController.createPrivilege);
privilegesRouter.put("/:id", privilegesController.updatePrivilege);
privilegesRouter.delete("/:id", privilegesController.deletePrivilege);
privilegesRouter.get("/tables" , privilegesController.getAllTables);
export default privilegesRouter;