import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { createReviewSchema, replyReviewSchema } from "../validators/review.validator";

export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createReviewSchema.parse(req.body);
  const result = await ReviewService.create(req.user!.id, data);
  return sendSuccess(res, result, "Review submitted", 201);
});

export const getPropertyReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await ReviewService.getByProperty(req.params.propertyId, req);
  return sendSuccess(res, result);
});

export const replyToReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reviewId, replyText } = replyReviewSchema.parse(req.body);
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner not found");
  const result = await ReviewService.reply(reviewId, partner.id, replyText);
  return sendSuccess(res, result, "Reply added");
});

export const adminGetAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await ReviewService.adminGetAll(req);
  return sendSuccess(res, result);
});

export const adminUpdateReviewStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await ReviewService.adminUpdateStatus(req.params.id, status);
  return sendSuccess(res, result, "Review status updated");
});
