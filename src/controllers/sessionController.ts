import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Session, Teacher, User } from "../models";
import { SessionStatus } from "../utils/constants";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/errors";

/**
 * POST /sessions
 * Create a new session for a teacher.
 * Default status: AVAILABLE. Validates teacher exists and endTime > startTime.
 */
export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teacherId, startTime, endTime } = req.body;

    // Validate teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new NotFoundError("Teacher");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate endTime > startTime
    if (end <= start) {
      throw new BadRequestError("End time must be greater than start time");
    }

    const session = await Session.create({
      teacherId,
      startTime: start,
      endTime: end,
      status: SessionStatus.AVAILABLE,
    });

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sessions/available?dateTimestamp={timestamp}
 * Return all AVAILABLE sessions for the supplied date.
 * Implemented using the MongoDB Aggregation Pipeline.
 */
export const getAvailableSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dateTimestamp } = req.query;

    const timestamp = Number(dateTimestamp);
    const date = new Date(timestamp);

    // Compute the start and end of the given day (UTC)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Aggregation pipeline to find available sessions for the date
    const sessions = await Session.aggregate([
      {
        $match: {
          status: SessionStatus.AVAILABLE,
          startTime: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          teacherId: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "teacher.fullName": 1,
          "teacher.email": 1,
          "teacher.specialization": 1,
          "teacher.experience": 1,
        },
      },
      {
        $sort: { startTime: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Available sessions retrieved successfully",
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /sessions/:id/book
 * Book an available session for a user.
 * Rules:
 *  - User must exist
 *  - Session must exist
 *  - Only AVAILABLE sessions can be booked
 *  - A booked session cannot be booked again
 *  - Updates status to BOOKED and associates user
 */
export const bookSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // Validate session exists
    const session = await Session.findById(id);
    if (!session) {
      throw new NotFoundError("Session");
    }

    // Only AVAILABLE sessions can be booked
    if (session.status === SessionStatus.BOOKED) {
      throw new ConflictError("This session is already booked");
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new ConflictError("This session is already completed");
    }

    if (session.status !== SessionStatus.AVAILABLE) {
      throw new BadRequestError("Only available sessions can be booked");
    }

    // Update session: set status to BOOKED and associate user
    session.status = SessionStatus.BOOKED;
    session.userId = new mongoose.Types.ObjectId(userId);
    await session.save();

    res.status(200).json({
      success: true,
      message: "Session booked successfully",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /sessions/:id/complete
 * Mark a booked session as completed.
 * Rules:
 *  - Session must exist
 *  - Only BOOKED sessions can be completed
 *  - Sets status to COMPLETED and records completedAt
 */
export const completeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate session exists
    const session = await Session.findById(id);
    if (!session) {
      throw new NotFoundError("Session");
    }

    // Only BOOKED sessions can be marked as completed
    if (session.status !== SessionStatus.BOOKED) {
      throw new BadRequestError("Only booked sessions can be marked as completed");
    }

    // Update session: set status to COMPLETED and record timestamp
    session.status = SessionStatus.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: "Session marked as completed",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/:id/sessions
 * Return all sessions for a user, separated into upcoming and completed.
 * Implemented using the MongoDB Aggregation Pipeline.
 */
export const getUserSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate user exists
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }

    const userId = new mongoose.Types.ObjectId(id as string);

    // Aggregation pipeline to get user's sessions grouped by status category
    const results = await Session.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          teacherId: 1,
          userId: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          completedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          "teacher.fullName": 1,
          "teacher.email": 1,
          "teacher.specialization": 1,
          "teacher.experience": 1,
        },
      },
      {
        $sort: { startTime: 1 },
      },
      {
        $group: {
          _id: null,
          upcomingSessions: {
            $push: {
              $cond: [
                { $eq: ["$status", SessionStatus.BOOKED] },
                "$$ROOT",
                null,
              ],
            },
          },
          completedSessions: {
            $push: {
              $cond: [
                { $eq: ["$status", SessionStatus.COMPLETED] },
                "$$ROOT",
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          upcomingSessions: {
            $filter: {
              input: "$upcomingSessions",
              cond: { $ne: ["$$this", null] },
            },
          },
          completedSessions: {
            $filter: {
              input: "$completedSessions",
              cond: { $ne: ["$$this", null] },
            },
          },
        },
      },
    ]);

    // Provide empty arrays if no sessions exist
    const data = results.length > 0
      ? results[0]
      : { upcomingSessions: [], completedSessions: [] };

    res.status(200).json({
      success: true,
      message: "User sessions retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
