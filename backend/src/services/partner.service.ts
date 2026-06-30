import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class PartnerService {
  static async onboard(userId: string, data: any) {
    const existing = await prisma.partner.findUnique({ where: { userId } });
    if (existing) throw ApiError.conflict("Partner profile already exists");
    return prisma.partner.create({ data: { ...data, userId, status: "PENDING" } });
  }

  static async getProfile(userId: string) {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      include: { user: { select: { email: true, fullName: true, phone: true } }, _count: { select: { properties: true, documents: true } } },
    });
    if (!partner) throw ApiError.notFound("Partner profile not found");
    return partner;
  }

  static async updateProfile(userId: string, data: any) {
    const partner = await prisma.partner.findUnique({ where: { userId } });
    if (!partner) throw ApiError.notFound("Partner not found");
    return prisma.partner.update({ where: { userId }, data });
  }

  static async getDashboard(userId: string) {
    const partner = await prisma.partner.findUnique({ where: { userId } });
    if (!partner) throw ApiError.notFound("Partner profile not found");

    const [properties, bookings, revenue, reviews] = await Promise.all([
      prisma.property.count({ where: { partnerId: partner.id } }),
      prisma.booking.count({ where: { property: { partnerId: partner.id } } }),
      prisma.booking.aggregate({ where: { property: { partnerId: partner.id }, status: { in: ["CONFIRMED", "COMPLETED"] } }, _sum: { totalAmount: true } }),
      prisma.review.count({ where: { property: { partnerId: partner.id }, status: "APPROVED" } }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      where: { property: { partnerId: partner.id } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true, email: true } }, property: { select: { title: true } } },
    });

    return {
      stats: { properties, bookings, revenue: revenue._sum.totalAmount || 0, reviews },
      recentBookings,
      partner: { id: partner.id, businessName: partner.businessName, status: partner.status, verificationLevel: partner.verificationLevel },
    };
  }

  static async getRevenue(userId: string) {
    const partner = await prisma.partner.findUnique({ where: { userId } });
    if (!partner) throw ApiError.notFound();
    const bookings = await prisma.booking.findMany({
      where: { property: { partnerId: partner.id }, status: { in: ["CONFIRMED", "COMPLETED"] } },
      select: { totalAmount: true, createdAt: true, status: true, property: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const commission = totalRevenue * (partner.commissionRate / 100);
    return { bookings, totalRevenue, commission, netRevenue: totalRevenue - commission };
  }

  static async adminGetAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { status } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: "desc" },
        include: { user: { select: { email: true, fullName: true, phone: true } }, _count: { select: { properties: true } } },
      }),
      prisma.partner.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async adminApprove(id: string) {
    return prisma.partner.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), verificationLevel: 1 } });
  }

  static async adminReject(id: string, reason?: string) {
    return prisma.partner.update({ where: { id }, data: { status: "REJECTED" } });
  }

  static async adminSuspend(id: string) {
    return prisma.partner.update({ where: { id }, data: { status: "SUSPENDED" } });
  }
}
