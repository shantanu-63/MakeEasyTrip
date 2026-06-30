import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class ReviewService {
  static async create(userId: string, data: any) {
    const booking = await prisma.booking.findFirst({
      where: { userId, propertyId: data.propertyId, status: "COMPLETED" },
    });

    const existing = await prisma.review.findFirst({ where: { userId, propertyId: data.propertyId } });
    if (existing) throw ApiError.conflict("You have already reviewed this property");

    const review = await prisma.review.create({
      data: {
        userId,
        propertyId: data.propertyId,
        rating: data.rating,
        title: data.title,
        text: data.text,
        isVerified: !!booking,
        status: "APPROVED",
      },
    });

    const reviews = await prisma.review.findMany({ where: { propertyId: data.propertyId, status: "APPROVED" } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.property.update({
      where: { id: data.propertyId },
      data: { rating: parseFloat(avgRating.toFixed(1)), ratingCount: reviews.length },
    });

    return review;
  }

  static async getByProperty(propertyId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { propertyId, status: "APPROVED" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true, avatarUrl: true } } },
      }),
      prisma.review.count({ where: { propertyId, status: "APPROVED" } }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async reply(reviewId: string, partnerId: string, replyText: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, property: { partnerId } } });
    if (!review) throw ApiError.notFound("Review not found");
    return prisma.review.update({ where: { id: reviewId }, data: { replyText, repliedAt: new Date() } });
  }

  static async adminGetAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { status } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true, email: true } }, property: { select: { title: true, city: true } } },
      }),
      prisma.review.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async adminUpdateStatus(id: string, status: string) {
    return prisma.review.update({ where: { id }, data: { status: status as any } });
  }
}
