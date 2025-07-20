import express from "express";
import cors from "cors";
import userRouter from "./userRoutes.js";
import privilegesRouter from "./privilegesRoutes.js";
import roleRouter from "./roleRouter.js";
import adminRoutes from "./adminRoutes.js";
import backupRouter from "../backup/backupRouter.js";
const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/privileges", privilegesRouter);
app.use("/api/roles", roleRouter);
app.use("/api/admin/login", adminRoutes);
app.use('/api/backup', backupRouter); 

app.listen(PORT, () => {
  console.log(`Server is running locally on port ${PORT}`);
});