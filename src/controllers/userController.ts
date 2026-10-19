import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { ConflictError } from "../utils/errors";

/**
 * POST /users
 * Create a new user. Email must be unique.
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, phone } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    const user = await User.create({ fullName, email, phone });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
