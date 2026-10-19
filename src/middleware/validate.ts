import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware to check express-validator validation results.
 * Returns 400 with detailed error messages if validation fails.
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((e) => e.msg),
    });
    return;
  }
  next();
};
