import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class BookingService {
  static async create(userId: string, data: any) {
    const property = await prisma.property.findFirst({ where: { id: data.propertyId, status: "APPROVED" } });
    if (!property) throw ApiError.notFound("Property not found or not available");

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    if (checkIn >= checkOut) throw ApiError.badRequest("Check-out must be after check-in");

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const baseAmount = property.price * nights;
    const taxAmount = parseFloat((baseAmount * 0.18).toFixed(2));
    const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId: data.propertyId,
        roomId: data.roomId || null,
        checkIn,
        checkOut,
        nights,
        guests: data.guests,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        specialRequests: data.specialRequests,
        baseAmount,
        taxAmount,
        totalAmount,
        status: "PENDING",
      },
      include: { property: { select: { title: true, city: true, image: true } } },
    });

    return booking;
  }

  static async getUserBookings(userId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { title: true, city: true, image: true, type: true } },
          room: { select: { name: true, type: true } },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.booking.count({ where: { userId } }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async getById(id: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id, userId },
      include: {
        property: true,
        room: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!booking) throw ApiError.notFound("Booking not found");
    return booking;
  }

  static async cancel(id: string, userId: string, reason?: string) {
    const booking = await prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw ApiError.notFound("Booking not found");
    if (!(["PENDING", "CONFIRMED"] as string[]).includes(booking.status))
      throw ApiError.badRequest("Cannot cancel this booking");
    return prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancellationReason: reason },
    });
  }

  static async getPartnerBookings(partnerId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: { property: { partnerId } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          property: { select: { title: true, city: true } },
          room: { select: { name: true } },
          payments: { take: 1 },
        },
      }),
      prisma.booking.count({ where: { property: { partnerId } } }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async adminGetAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { status } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { fullName: true, email: true } },
          property: { select: { title: true, city: true } },
          payments: { take: 1 },
        },
      }),
      prisma.booking.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.booking.update({ where: { id }, data: { status: status as any } });
  }
}
