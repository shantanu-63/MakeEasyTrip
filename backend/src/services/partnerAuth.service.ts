import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { logger } from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET || "met-dev-secret-2026";
const JWT_EXPIRES_IN = "7d";

export class PartnerAuthService {
  static signToken(payload: { id: string; email: string; role: string; fullName: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  }

  static async register(data: { email: string; fullName: string; password: string }) {
    // 1. Check if email already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 3. Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 4. Store verification OTP securely, upserting if retry
    await prisma.partnerVerificationOTP.upsert({
      where: { email: data.email.toLowerCase() },
      update: {
        fullName: data.fullName,
        passwordHash,
        otpCode,
        expiresAt,
      },
      create: {
        email: data.email.toLowerCase(),
        fullName: data.fullName,
        passwordHash,
        otpCode,
        expiresAt,
      },
    });

    logger.info(`Partner registration OTP generated for: ${data.email}. OTP Code: ${otpCode}`);
    
    // In production we would send an email, here we return it in mock mode so the user can verify
    return { email: data.email, message: "OTP sent to your email", otpCode };
  }

  static async verifyOtp(email: string, otpCode: string, businessDetails: {
    businessName: string;
    partnerType: "HOTELIER" | "ACTIVITY_PROVIDER" | "TRAVEL_AGENCY";
    ownerName: string;
    mobileNumber: string;
    businessAddress: string;
    city: string;
    state: string;
    pincode: string;
  }) {
    const record = await prisma.partnerVerificationOTP.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!record) {
      throw ApiError.notFound("Verification record not found. Please register first.");
    }

    if (record.otpCode !== otpCode) {
      throw ApiError.badRequest("Invalid OTP code.");
    }

    if (record.expiresAt < new Date()) {
      throw ApiError.badRequest("OTP has expired. Please request a new one.");
    }

    // Double check email availability again right before creation to prevent race conditions
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    // OTP succeeded: Create user and partner account inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: record.passwordHash,
          fullName: record.fullName,
          role: "PARTNER",
          isVerified: true,
        },
      });

      const partner = await tx.partner.create({
        data: {
          userId: user.id,
          businessName: businessDetails.businessName,
          partnerType: businessDetails.partnerType,
          ownerName: businessDetails.ownerName,
          mobileNumber: businessDetails.mobileNumber,
          businessAddress: businessDetails.businessAddress,
          city: businessDetails.city,
          state: businessDetails.state,
          pincode: businessDetails.pincode,
          status: "PENDING",
        },
      });

      // Delete the OTP verification record
      await tx.partnerVerificationOTP.delete({
        where: { email: email.toLowerCase() },
      });

      return { user, partner };
    });

    logger.info(`Partner account successfully created after OTP verification: ${email}`);
    return result;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { partnerProfile: true },
    });

    if (!user || user.role !== "PARTNER") {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    if (user.partnerProfile?.status === "SUSPENDED") {
      throw ApiError.forbidden("Your partner account has been suspended.");
    }

    // Generate JWT
    const token = this.signToken({
      id: user.partnerProfile!.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    // Save token in PartnerSession registry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.partnerSession.upsert({
      where: { token },
      update: { expiresAt },
      create: {
        partnerId: user.partnerProfile!.id,
        token,
        expiresAt,
      },
    });

    logger.info(`Partner login session created: ${email}`);
    return {
      partner: {
        id: user.partnerProfile!.id,
        businessName: user.partnerProfile!.businessName,
        email: user.email,
        role: "PARTNER",
      },
      token,
    };
  }

  static async logout(token: string) {
    await prisma.partnerSession.deleteMany({
      where: { token },
    });
    logger.info("Partner session terminated successfully.");
  }
}
