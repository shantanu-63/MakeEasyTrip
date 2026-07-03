import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class AdminService {
  static async getDashboardStats() {
    const [users, partners, properties, bookings, revenue, reviews, tickets] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.partner.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } }, _sum: { totalAmount: true } }),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true } }, property: { select: { title: true, city: true } } },
    });

    const pendingApprovals = await prisma.property.count({ where: { status: "PENDING" } });
    const pendingPartners = await prisma.partner.count({ where: { status: "PENDING" } });

    return {
      stats: {
        totalCustomers: users,
        totalPartners: partners,
        totalProperties: properties,
        totalBookings: bookings,
        totalRevenue: revenue._sum.totalAmount || 0,
        pendingReviews: reviews,
        openTickets: tickets,
        pendingApprovals: pendingApprovals + pendingPartners,
      },
      recentBookings,
    };
  }

  static async getUsers(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { role, search } = req.query as Record<string, string>;
    const where: any = {};
    if (role) where.role = role.toUpperCase();
    if (search) where.OR = [{ email: { contains: search, mode: "insensitive" } }, { fullName: { contains: search, mode: "insensitive" } }];
    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true, lastLoginAt: true } }),
      prisma.user.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async updateUser(id: string, data: any) {
    return prisma.user.update({ where: { id }, data, select: { id: true, email: true, fullName: true, role: true, isActive: true } });
  }

  static async deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    return { message: "User deleted" };
  }

  static async getPendingApprovals(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [properties, partners] = await Promise.all([
      prisma.property.findMany({
        where: { status: "PENDING" },
        skip,
        take: Math.floor(limit / 2),
        orderBy: { createdAt: "desc" },
        include: { partner: { select: { businessName: true, status: true } } },
      }),
      prisma.partner.findMany({
        where: { status: "PENDING" },
        skip,
        take: Math.ceil(limit / 2),
        orderBy: { joinedAt: "desc" },
        include: { user: { select: { email: true, fullName: true } } },
      }),
    ]);
    return { properties, partners };
  }

  static async approveProperty(id: string, adminEmail: string = "admin@makeeasytrip.com") {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.property.update({ where: { id }, data: { status: "APPROVED" } });
      await tx.adminAction.create({
        data: {
          propertyId: id,
          actionType: "APPROVE",
          reason: "Approved by system administrator",
          adminEmail,
        },
      });
      return updated;
    });
  }

  static async rejectProperty(id: string, reason: string = "Rejected by system administrator", adminEmail: string = "admin@makeeasytrip.com") {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.property.update({ where: { id }, data: { status: "REJECTED" } });
      await tx.adminAction.create({
        data: {
          propertyId: id,
          actionType: "REJECT",
          reason,
          adminEmail,
        },
      });
      return updated;
    });
  }

  static async getBanners() {
    return prisma.cmsBanner.findMany({ where: { status: "Published" }, orderBy: { displayOrder: "asc" } });
  }

  static async getAllBanners() {
    return prisma.cmsBanner.findMany({ orderBy: { displayOrder: "asc" } });
  }

  static async createBanner(data: any) {
    return prisma.cmsBanner.create({ data });
  }

  static async updateBanner(id: string, data: any) {
    return prisma.cmsBanner.update({ where: { id }, data });
  }

  static async deleteBanner(id: string) {
    await prisma.cmsBanner.delete({ where: { id } });
    return { message: "Banner deleted" };
  }

  static async getReportsTelemetry() {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsers, newBookings, newRevenue] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: last30 } } }),
      prisma.booking.count({ where: { createdAt: { gte: last30 } } }),
      prisma.booking.aggregate({ where: { createdAt: { gte: last30 }, status: { in: ["CONFIRMED", "COMPLETED"] } }, _sum: { totalAmount: true } }),
    ]);
    return { period: "Last 30 days", newUsers, newBookings, newRevenue: newRevenue._sum.totalAmount || 0 };
  }
}
