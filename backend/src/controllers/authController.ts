import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators/auth.validator";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await AuthService.register(data);
  return sendSuccess(res, result, "Account created successfully", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await AuthService.login(email, password);
  return sendSuccess(res, result, "Login successful");
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await AuthService.getProfile(req.user!.id);
  return sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, avatarUrl } = req.body;
  const user = await AuthService.updateProfile(req.user!.id, { fullName, phone, avatarUrl });
  return sendSuccess(res, user, "Profile updated");
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const result = await AuthService.changePassword(req.user!.id, currentPassword, newPassword);
  return sendSuccess(res, result);
});

export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await AuthService.deleteAccount(req.user!.id);
  return sendSuccess(res, null, "Account deleted");
});
