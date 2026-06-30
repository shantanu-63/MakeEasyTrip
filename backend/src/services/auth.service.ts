import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { logger } from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET || "met-dev-secret-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class AuthService {
  static signToken(payload: { id: string; email: string; role: string; fullName: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  }

  static async register(data: { email: string; password: string; fullName: string; phone?: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: (data.role as any) || "CUSTOMER",
      },
      select: { id: true, email: true, fullName: true, role: true, phone: true, createdAt: true },
    });

    const token = this.signToken({ id: user.id, email: user.email, role: user.role, fullName: user.fullName });
    logger.info(`User registered: ${user.email} (${user.role})`);
    return { user, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true, fullName: true, role: true, isActive: true },
    });

    if (!user) throw ApiError.unauthorized("Invalid email or password");
    if (!user.isActive) throw ApiError.forbidden("Account has been deactivated");

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw ApiError.unauthorized("Invalid email or password");

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = this.signToken({ id: user.id, email: user.email, role: user.role, fullName: user.fullName });
    logger.info(`User login: ${user.email}`);
    return { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, token };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, phone: true, role: true, avatarUrl: true, createdAt: true, isVerified: true },
    });
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  static async updateProfile(userId: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true },
    });
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound();
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) throw ApiError.unauthorized("Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: "Password changed successfully" };
  }

  static async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
    return { message: "Account deleted" };
  }
}
