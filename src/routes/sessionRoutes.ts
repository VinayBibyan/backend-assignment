import { Router } from "express";
import {
  createSession,
  getAvailableSessions,
  bookSession,
  completeSession,
} from "../controllers/sessionController";
import {
  createSessionValidation,
  availableSessionsValidation,
  bookSessionValidation,
  completeSessionValidation,
} from "../validators";
import { validate } from "../middleware/validate";

const router = Router();

// POST /sessions - Create a new session
router.post("/", createSessionValidation, validate, createSession);

// GET /sessions/available?dateTimestamp={timestamp} - Get available sessions
router.get(
  "/available",
  availableSessionsValidation,
  validate,
  getAvailableSessions
);

// POST /sessions/:id/book - Book a session
router.post("/:id/book", bookSessionValidation, validate, bookSession);

// PATCH /sessions/:id/complete - Mark session as complete
router.patch(
  "/:id/complete",
  completeSessionValidation,
  validate,
  completeSession
);

export default router;
