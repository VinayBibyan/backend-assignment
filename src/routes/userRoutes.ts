import { Router } from "express";
import { createUser } from "../controllers/userController";
import { getUserSessions } from "../controllers/sessionController";
import { createUserValidation, userSessionsValidation } from "../validators";
import { validate } from "../middleware/validate";

const router = Router();

// POST /users - Create a new user
router.post("/", createUserValidation, validate, createUser);

// GET /users/:id/sessions - Get user sessions (upcoming & completed)
router.get("/:id/sessions", userSessionsValidation, validate, getUserSessions);

export default router;
