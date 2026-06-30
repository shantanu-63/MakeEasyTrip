import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";

export const broadcast = asyncHandler(async (req: Request, res: Response) => {
  const result = await NotificationService.broadcast(req.body);
  return sendSuccess(res, result, "Notification broadcast sent", 201);
});

export const getMyNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await NotificationService.getUserNotifications(req.user!.id, req);
  return sendSuccess(res, result);
});

export const markRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await NotificationService.markRead(req.params.id, req.user!.id);
  return sendSuccess(res, result, "Marked as read");
});

export const markAllRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await NotificationService.markAllRead(req.user!.id);
  return sendSuccess(res, result, "All marked as read");
});

export const getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await NotificationService.getUnreadCount(req.user!.id);
  return sendSuccess(res, result);
});
