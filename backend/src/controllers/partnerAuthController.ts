import { Request, Response } from "express";
import { PartnerAuthService } from "../services/partnerAuth.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6),
  businessDetails: z.object({
    businessName: z.string().min(2),
    partnerType: z.enum(["HOTELIER", "ACTIVITY_PROVIDER", "TRAVEL_AGENCY"]),
    ownerName: z.string().min(2),
    mobileNumber: z.string(),
    businessAddress: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await PartnerAuthService.register(data);
  return sendSuccess(res, result, "OTP sent to your email. Verify OTP to activate your account.", 200);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otpCode, businessDetails } = verifyOtpSchema.parse(req.body);
  const result = await PartnerAuthService.verifyOtp(email, otpCode, businessDetails);
  return sendSuccess(res, result, "Partner account activated successfully. You can now login.", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await PartnerAuthService.login(email, password);

  // Store JWT in an HttpOnly Secure Cookie
  res.cookie("met_partner_token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccess(res, { partner: result.partner }, "Login successful");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.met_partner_token;
  if (token) {
    await PartnerAuthService.logout(token);
  }
  res.clearCookie("met_partner_token");
  return sendSuccess(res, null, "Logout successful");
});

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  return sendSuccess(res, { user: req.user }, "Profile retrieved successfully");
});
