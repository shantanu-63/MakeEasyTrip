import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class DestinationService {
  static async getAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { country, budget } = req.query as Record<string, string>;
    const where: any = { isActive: true };
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (budget) where.budget = budget;
    const [data, total] = await Promise.all([
      prisma.destination.findMany({ where, skip, take: limit, orderBy: { rating: "desc" } }),
      prisma.destination.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async getById(id: string) {
    const dest = await prisma.destination.findFirst({
      where: { id, isActive: true },
      include: {
        properties: { where: { status: "APPROVED" }, take: 6, select: { id: true, title: true, type: true, price: true, rating: true, image: true, city: true } },
        reviews: { orderBy: { date: "desc" }, take: 5 },
      },
    });
    if (!dest) throw ApiError.notFound("Destination not found");
    return dest;
  }

  static async create(data: any) {
    return prisma.destination.create({ data });
  }

  static async update(id: string, data: any) {
    return prisma.destination.update({ where: { id }, data });
  }

  static async delete(id: string) {
    await prisma.destination.update({ where: { id }, data: { isActive: false } });
    return { message: "Destination archived" };
  }
}
