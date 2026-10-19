import { Router } from "express";
import { createTeacher } from "../controllers/teacherController";

const router = Router();

// POST /teachers - Create a new teacher
router.post("/", createTeacher);

export default router;
