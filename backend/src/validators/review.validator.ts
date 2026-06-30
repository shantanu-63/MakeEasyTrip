import { z } from "zod";

export const createReviewSchema = z.object({
  propertyId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  text: z.string().min(10, "Review must be at least 10 characters"),
});

export const replyReviewSchema = z.object({
  reviewId: z.string().uuid(),
  replyText: z.string().min(5),
});
