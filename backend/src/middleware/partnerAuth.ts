import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../lib/ApiError";
import { prisma } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "met-dev-secret-2026";

export const verifyPartnerSession = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.met_partner_token;
    if (!token) {
      throw ApiError.unauthorized("Authentication required. Please log in.");
    }

    // Verify token exists in active sessions
    const session = await prisma.partnerSession.findUnique({
      where: { token },
    });
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie("met_partner_token");
      throw ApiError.unauthorized("Session expired. Please log in again.");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "PARTNER") {
      throw ApiError.forbidden("Access denied. Authorized partners only.");
    }

    // Attach decoded user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };
    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      res.clearCookie("met_partner_token");
      return next(ApiError.unauthorized("Session invalid or expired. Please sign in again."));
    }
    next(err);
  }
};
