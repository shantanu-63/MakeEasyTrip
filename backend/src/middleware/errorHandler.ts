import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/ApiError";
import { logger } from "../config/logger";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
  }

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(`[${err.statusCode}] ${err.message}`, { path: req.path });
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ success: false, message: "A record with this value already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack, path: req.path });
  return res.status(500).json({ success: false, message: "Internal server error" });
}
