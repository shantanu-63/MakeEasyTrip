import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../lib/ApiError";

const JWT_SECRET = process.env.JWT_SECRET || "met-dev-secret-2026";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "CUSTOMER" | "PARTNER" | "ADMIN";
    fullName: string;
  };
}

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) throw ApiError.unauthorized("No token provided");

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };
    next();
  } catch (err: any) {
    if (err instanceof ApiError) return next(err);
    if (err.name === "TokenExpiredError") return next(ApiError.unauthorized("Token expired"));
    return next(ApiError.unauthorized("Invalid token"));
  }
};

export const checkRole = (roles: ("CUSTOMER" | "PARTNER" | "ADMIN")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role))
      return next(ApiError.forbidden(`Required role: ${roles.join(" or ")}`));
    next();
  };
};

export const optionalToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role, fullName: decoded.fullName };
  } catch {}
  next();
};
