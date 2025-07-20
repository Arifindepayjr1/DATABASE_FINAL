import express from "express";
import adminController from "./controllers/adminController.js";

const adminRoutes = express.Router();

adminRoutes.post("/" , adminController.login);

export default adminRoutes;