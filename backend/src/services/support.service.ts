import { prisma } from "../config/db";
import { ApiError } from "../lib/ApiError";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class SupportService {
  static async createTicket(userId: string, data: { subject: string; category: string; priority?: string }) {
    return prisma.supportTicket.create({
      data: { userId, ...data, priority: (data.priority as any) || "MEDIUM" },
    });
  }

  static async getUserTickets(userId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [data, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      prisma.supportTicket.count({ where: { userId } }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async getTicketWithMessages(ticketId: string, userId: string) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
      include: { messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { fullName: true, role: true, avatarUrl: true } } } } },
    });
    if (!ticket) throw ApiError.notFound("Ticket not found");
    return ticket;
  }

  static async addMessage(ticketId: string, senderId: string, senderRole: string, text: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw ApiError.notFound("Ticket not found");
    if (ticket.status === "CLOSED") throw ApiError.badRequest("Cannot message on a closed ticket");
    return prisma.message.create({
      data: { ticketId, senderId, senderRole: senderRole as any, text },
      include: { sender: { select: { fullName: true, role: true } } },
    });
  }

  static async adminGetAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const { status, priority } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (priority) where.priority = priority.toUpperCase();
    const [data, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true, email: true } }, _count: { select: { messages: true } } },
      }),
      prisma.supportTicket.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async adminUpdateTicket(id: string, data: { status?: string; assignedTo?: string; priority?: string }) {
    return prisma.supportTicket.update({ where: { id }, data: data as any });
  }
}
