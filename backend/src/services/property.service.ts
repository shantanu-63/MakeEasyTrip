import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class PropertyService {
  static async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { city, type, minPrice, maxPrice, rating, sort } = req.query as Record<string, string>;

    const where: any = { status: "APPROVED" };
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (type) where.type = type.toUpperCase();
    if (minPrice || maxPrice) where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
    if (rating) where.rating = { gte: parseFloat(rating) };

    let orderBy: any = { isFeatured: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "rating_desc") orderBy = { rating: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    const [data, total] = await Promise.all([
      prisma.property.findMany({ where, orderBy, skip, take: limit, include: { destination: { select: { name: true, country: true } }, partner: { select: { businessName: true } } } }),
      prisma.property.count({ where }),
    ]);

    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async getById(id: string) {
    const property = await prisma.property.findFirst({
      where: { id, status: "APPROVED" },
      include: {
        rooms: { where: { isAvailable: true } },
        reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { fullName: true, avatarUrl: true } } } },
        destination: true,
        partner: { select: { businessName: true, city: true } },
      },
    });
    if (!property) throw ApiError.notFound("Property not found");
    return property;
  }

  static async getPartnerProperties(partnerId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [data, total] = await Promise.all([
      prisma.property.findMany({ where: { partnerId }, skip, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { bookings: true, reviews: true, rooms: true } } } }),
      prisma.property.count({ where: { partnerId } }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async create(partnerId: string, data: any) {
    return prisma.property.create({
      data: { ...data, partnerId, status: "PENDING", type: data.type.toUpperCase() },
    });
  }

  static async update(id: string, partnerId: string, data: any) {
    const property = await prisma.property.findFirst({ where: { id, partnerId } });
    if (!property) throw ApiError.notFound("Property not found or not yours");
    return prisma.property.update({ where: { id }, data });
  }

  static async delete(id: string, partnerId: string) {
    const property = await prisma.property.findFirst({ where: { id, partnerId } });
    if (!property) throw ApiError.notFound("Property not found or not yours");
    await prisma.property.delete({ where: { id } });
    return { message: "Property deleted" };
  }

  static async adminUpdate(id: string, data: any) {
    return prisma.property.update({ where: { id }, data });
  }

  static async checkAvailability(propertyId: string, roomId: string | undefined, checkIn: Date, checkOut: Date) {
    if (roomId) {
      const conflict = await prisma.booking.findFirst({
        where: {
          roomId,
          status: { in: ["PENDING", "CONFIRMED"] },
          OR: [
            { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
          ],
        },
      });
      return !conflict;
    }
    return true;
  }
}
