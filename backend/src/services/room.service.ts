import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";

export class RoomService {
  static async getRoomsByProperty(propertyId: string) {
    return prisma.room.findMany({ where: { propertyId }, orderBy: { price: "asc" } });
  }

  static async getPartnerRooms(partnerId: string) {
    return prisma.room.findMany({
      where: { property: { partnerId } },
      include: { property: { select: { title: true, city: true } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(partnerId: string, data: any) {
    const property = await prisma.property.findFirst({ where: { id: data.propertyId, partnerId } });
    if (!property) throw ApiError.notFound("Property not found or not yours");
    return prisma.room.create({ data });
  }

  static async update(id: string, partnerId: string, data: any) {
    const room = await prisma.room.findFirst({ where: { id, property: { partnerId } } });
    if (!room) throw ApiError.notFound("Room not found or not yours");
    return prisma.room.update({ where: { id }, data });
  }

  static async delete(id: string, partnerId: string) {
    const room = await prisma.room.findFirst({ where: { id, property: { partnerId } } });
    if (!room) throw ApiError.notFound("Room not found");
    await prisma.room.delete({ where: { id } });
    return { message: "Room deleted" };
  }
}
