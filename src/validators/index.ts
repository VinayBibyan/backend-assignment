import { body, param, query } from "express-validator";

/**
 * Validation rules for user-related endpoints.
 */
export const createUserValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be a string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isString()
    .withMessage("Phone must be a string"),
];

/**
 * Validation rules for session creation.
 */
export const createSessionValidation = [
  body("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date"),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date"),
];

/**
 * Validation rules for booking a session.
 */
export const bookSessionValidation = [
  param("id").isMongoId().withMessage("Invalid session ID format"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

/**
 * Validation rules for completing a session.
 */
export const completeSessionValidation = [
  param("id").isMongoId().withMessage("Invalid session ID format"),
];

/**
 * Validation rules for fetching available sessions.
 */
export const availableSessionsValidation = [
  query("dateTimestamp")
    .notEmpty()
    .withMessage("dateTimestamp query parameter is required")
    .isNumeric()
    .withMessage("dateTimestamp must be a numeric timestamp"),
];

/**
 * Validation rules for fetching user sessions.
 */
export const userSessionsValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];
