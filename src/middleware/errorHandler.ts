import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import config from "../config";

/**
 * Centralized error handling middleware.
 * Catches all errors thrown in route handlers and returns a consistent JSON response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value: A record with this ${field} already exists`,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: `Invalid ${(err as any).path}: ${(err as any).value}`,
    });
    return;
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message:
      config.nodeEnv === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
};
