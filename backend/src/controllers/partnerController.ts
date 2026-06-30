import { Request, Response } from "express";
import { PartnerService } from "../services/partner.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";

export const onboardPartner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await PartnerService.onboard(req.user!.id, req.body);
  return sendSuccess(res, result, "Partner profile created. Pending approval.", 201);
});

export const getPartnerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await PartnerService.getProfile(req.user!.id);
  return sendSuccess(res, result);
});

export const updatePartnerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await PartnerService.updateProfile(req.user!.id, req.body);
  return sendSuccess(res, result, "Profile updated");
});

export const getPartnerDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await PartnerService.getDashboard(req.user!.id);
  return sendSuccess(res, result);
});

export const getPartnerRevenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await PartnerService.getRevenue(req.user!.id);
  return sendSuccess(res, result);
});

export const getPartnerProperties = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { PropertyService } = await import("../services/property.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await PropertyService.getPartnerProperties(partner.id, req);
  return sendSuccess(res, result);
});

export const addProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { PropertyService } = await import("../services/property.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await PropertyService.create(partner.id, req.body);
  return sendSuccess(res, result, "Property submitted", 201);
});

export const updateProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { PropertyService } = await import("../services/property.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await PropertyService.update(req.params.id, partner.id, req.body);
  return sendSuccess(res, result, "Property updated");
});

export const deleteProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { PropertyService } = await import("../services/property.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await PropertyService.delete(req.params.id, partner.id);
  return sendSuccess(res, result);
});

export const getRooms = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { RoomService } = await import("../services/room.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await RoomService.getPartnerRooms(partner.id);
  return sendSuccess(res, result);
});

export const addRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { RoomService } = await import("../services/room.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await RoomService.create(partner.id, req.body);
  return sendSuccess(res, result, "Room added", 201);
});

export const deleteRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { RoomService } = await import("../services/room.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await RoomService.delete(req.params.id, partner.id);
  return sendSuccess(res, result);
});

export const getPartnerBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { BookingService } = await import("../services/booking.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await BookingService.getPartnerBookings(partner.id, req);
  return sendSuccess(res, result);
});

export const verifyBookingStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { BookingService } = await import("../services/booking.service");
  const { status } = req.body;
  const result = await BookingService.updateStatus(req.params.id, status);
  return sendSuccess(res, result, "Booking status updated");
});

export const replyToReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ReviewService } = await import("../services/review.service");
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await ReviewService.reply(req.body.reviewId, partner.id, req.body.replyText);
  return sendSuccess(res, result, "Reply added");
});
