import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";
import { DestinationService } from "../services/destination.service";
import { BookingService } from "../services/booking.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";

export const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.getAll(req);
  return sendSuccess(res, result);
});

export const getDestinationDetails = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.getById(req.params.id);
  return sendSuccess(res, result);
});

export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  const result = await PropertyService.getAll(req);
  return sendSuccess(res, result);
});

export const getPropertyDetails = asyncHandler(async (req: Request, res: Response) => {
  const result = await PropertyService.getById(req.params.id);
  return sendSuccess(res, result);
});

export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingService.create(req.user!.id, req.body);
  return sendSuccess(res, result, "Booking created", 201);
});

export const getMyBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingService.getUserBookings(req.user!.id, req);
  return sendSuccess(res, result);
});

export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingService.cancel(req.params.id, req.user!.id, req.body.reason);
  return sendSuccess(res, result, "Booking cancelled");
});

export const verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, { verified: true }, "Payment noted");
});

export const addReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ReviewService } = await import("../services/review.service");
  const result = await ReviewService.create(req.user!.id, req.body);
  return sendSuccess(res, result, "Review submitted", 201);
});

export const createSupportTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { SupportService } = await import("../services/support.service");
  const result = await SupportService.createTicket(req.user!.id, req.body);
  return sendSuccess(res, result, "Ticket created", 201);
});

export const getMyTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { SupportService } = await import("../services/support.service");
  const result = await SupportService.getUserTickets(req.user!.id, req);
  return sendSuccess(res, result);
});

export const replyToTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { SupportService } = await import("../services/support.service");
  const result = await SupportService.addMessage(req.body.ticketId, req.user!.id, req.user!.role, req.body.text);
  return sendSuccess(res, result, "Message sent", 201);
});

export const getWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.id },
    include: { property: { select: { id: true, title: true, city: true, price: true, rating: true, image: true, type: true } } },
    orderBy: { addedAt: "desc" },
  });
  return sendSuccess(res, wishlist);
});

export const addToWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { propertyId } = req.body;
  if (!propertyId) throw ApiError.badRequest("propertyId required");
  const item = await prisma.wishlistItem.upsert({
    where: { userId_propertyId: { userId: req.user!.id, propertyId } },
    create: { userId: req.user!.id, propertyId },
    update: {},
  });
  return sendSuccess(res, item, "Added to wishlist", 201);
});

export const removeFromWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user!.id, propertyId: req.params.propertyId } });
  return sendSuccess(res, null, "Removed from wishlist");
});
