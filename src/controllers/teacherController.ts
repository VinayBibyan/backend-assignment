import { Request, Response, NextFunction } from "express";
import { Teacher } from "../models";
import { ConflictError } from "../utils/errors";

/**
 * POST /teachers
 * Create a new teacher. Email must be unique.
 */
export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, specialization, experience } = req.body;

    // Check if teacher with the same email already exists
    const existingTeacher = await Teacher.findOne({
      email: email.toLowerCase(),
    });
    if (existingTeacher) {
      throw new ConflictError("A teacher with this email already exists");
    }

    const teacher = await Teacher.create({
      fullName,
      email,
      specialization,
      experience,
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};
