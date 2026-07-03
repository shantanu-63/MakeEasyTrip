import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { PartnerService } from "../services/partner.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();
  return sendSuccess(res, result);
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getUsers(req);
  return sendSuccess(res, result);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.updateUser(req.params.id, req.body);
  return sendSuccess(res, result, "User updated");
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.deleteUser(req.params.id);
  return sendSuccess(res, result);
});

export const getPendingApprovals = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getPendingApprovals(req);
  return sendSuccess(res, result);
});

export const approveProperty = asyncHandler(async (req: any, res: Response) => {
  const adminEmail = req.user?.email || "admin@makeeasytrip.com";
  const result = await AdminService.approveProperty(req.params.id, adminEmail);
  return sendSuccess(res, result, "Property approved");
});

export const rejectProperty = asyncHandler(async (req: any, res: Response) => {
  const adminEmail = req.user?.email || "admin@makeeasytrip.com";
  const reason = req.body?.reason || "Rejected by administrator";
  const result = await AdminService.rejectProperty(req.params.id, reason, adminEmail);
  return sendSuccess(res, result, "Property rejected");
});

export const approvePartner = asyncHandler(async (req: Request, res: Response) => {
  const result = await PartnerService.adminApprove(req.params.id);
  return sendSuccess(res, result, "Partner approved");
});

export const rejectPartner = asyncHandler(async (req: Request, res: Response) => {
  const result = await PartnerService.adminReject(req.params.id);
  return sendSuccess(res, result, "Partner rejected");
});

export const getPartners = asyncHandler(async (req: Request, res: Response) => {
  const result = await PartnerService.adminGetAll(req);
  return sendSuccess(res, result);
});

export const getCmsBanners = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getBanners();
  return sendSuccess(res, result);
});

export const getAllBanners = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllBanners();
  return sendSuccess(res, result);
});

export const createBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.createBanner(req.body);
  return sendSuccess(res, result, "Banner created", 201);
});

export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.updateBanner(req.params.id, req.body);
  return sendSuccess(res, result, "Banner updated");
});

export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.deleteBanner(req.params.id);
  return sendSuccess(res, result);
});

export const getReports = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getReportsTelemetry();
  return sendSuccess(res, result);
});

export const getAdminStats = getDashboard;
export const getApprovalsQueue = getPendingApprovals;
export const sendBroadcastNotification = asyncHandler(async (req: Request, res: Response) => {
  const { NotificationService } = await import("../services/notification.service");
  const result = await NotificationService.broadcast(req.body);
  return sendSuccess(res, result, "Notification sent");
});
export const getReportsTelemetry = getReports;
