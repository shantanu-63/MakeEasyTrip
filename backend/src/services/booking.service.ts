import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class BookingService {
  static async create(userId: string, data: any) {
    const property = await prisma.property.findFirst({ 
      where: { id: data.propertyId, status: "APPROVED" },
      include: { rooms: true }
    });
    if (!property) throw ApiError.notFound("Property not found or not available");

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    if (checkIn >= checkOut) throw ApiError.badRequest("Check-out must be after check-in");

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check room inventory if roomId is provided
    const nightsToBook: Date[] = [];
    const currentDate = new Date(checkIn);
    while (currentDate < checkOut) {
      nightsToBook.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (data.roomId) {
      const room = await prisma.room.findUnique({ where: { id: data.roomId } });
      if (!room) throw ApiError.notFound("Room not found");

      for (const night of nightsToBook) {
        const inv = await prisma.inventory.findUnique({
          where: {
            roomId_date: {
              roomId: data.roomId,
              date: night,
            },
          },
        });

        const totalCapacity = room.totalCount;
        const booked = inv ? inv.bookedRooms : 0;
        const blocked = inv ? inv.blockedRooms : 0;
        
        if (totalCapacity - blocked - booked <= 0) {
          throw ApiError.badRequest(`Room is fully booked on ${night.toISOString().split("T")[0]}`);
        }
      }
    }

    // Pricing Calculation: Base Price + 15% Admin Commission + 18% Tax
    const baseAmount = (data.roomId ? (property.rooms.find(r => r.id === data.roomId)?.price || property.price) : property.price) * nights;
    const commissionAmount = baseAmount * 0.15;
    const taxAmount = parseFloat(((baseAmount + commissionAmount) * 0.18).toFixed(2));
    const totalAmount = parseFloat((baseAmount + commissionAmount + taxAmount).toFixed(2));

    // Create booking and update inventory inside a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Create booking with guests list
      const newBooking = await tx.booking.create({
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
          guestPhone: data.guestPhone || null,
          specialRequests: data.specialRequests || null,
          baseAmount,
          taxAmount,
          totalAmount,
          status: "PENDING",
          guestsList: data.guestsList && data.guestsList.length > 0 ? {
            create: data.guestsList.map((g: any) => ({
              fullName: g.fullName,
              age: g.age ? parseInt(g.age) : null,
              gender: g.gender || null,
            })),
          } : undefined
        },
        include: { property: { select: { title: true, city: true, image: true } } },
      });

      // 2. Reduce room availability by incrementing booked count
      if (data.roomId) {
        const room = await tx.room.findUnique({ where: { id: data.roomId } });
        const roomTotal = room?.totalCount || 1;

        for (const night of nightsToBook) {
          await tx.inventory.upsert({
            where: {
              roomId_date: {
                roomId: data.roomId,
                date: night,
              },
            },
            update: {
              bookedRooms: { increment: 1 },
              availableRooms: { decrement: 1 },
            },
            create: {
              roomId: data.roomId,
              date: night,
              bookedRooms: 1,
              blockedRooms: 0,
              availableRooms: roomTotal - 1,
            },
          });
        }
      }

      return newBooking;
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
