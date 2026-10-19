import { Router } from "express";
import userRoutes from "./userRoutes";
import teacherRoutes from "./teacherRoutes";
import sessionRoutes from "./sessionRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/teachers", teacherRoutes);
router.use("/sessions", sessionRoutes);

export default router;
