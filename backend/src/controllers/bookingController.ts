import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { createBookingSchema, cancelBookingSchema } from "../validators/booking.validator";

export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createBookingSchema.parse(req.body);
  const result = await BookingService.create(req.user!.id, data);
  return sendSuccess(res, result, "Booking created", 201);
});

export const getMyBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingService.getUserBookings(req.user!.id, req);
  return sendSuccess(res, result);
});

export const getBookingById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingService.getById(req.params.id, req.user!.id);
  return sendSuccess(res, result);
});

export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reason } = cancelBookingSchema.parse(req.body);
  const result = await BookingService.cancel(req.params.id, req.user!.id, reason);
  return sendSuccess(res, result, "Booking cancelled");
});

export const getPartnerBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner profile not found");
  const result = await BookingService.getPartnerBookings(partner.id, req);
  return sendSuccess(res, result);
});

export const updateBookingStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const result = await BookingService.updateStatus(req.params.id, status);
  return sendSuccess(res, result, "Booking status updated");
});

export const adminGetAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await BookingService.adminGetAll(req);
  return sendSuccess(res, result);
});
