import { prisma } from "../config/db";
import { getPagination, paginatedResponse } from "../lib/paginate";
import { Request } from "express";

export class NotificationService {
  static async broadcast(data: { title: string; message: string; targetRole: string; type: string; imageUrl?: string; actionUrl?: string }) {
    const notification = await prisma.systemNotification.create({ data: data as any });

    const where: any = {};
    if (data.targetRole !== "ALL") where.role = data.targetRole;
    const users = await prisma.user.findMany({ where, select: { id: true } });

    if (users.length > 0) {
      await prisma.userNotification.createMany({
        data: users.map((u) => ({ userId: u.id, notificationId: notification.id })),
        skipDuplicates: true,
      });
    }
    return notification;
  }

  static async getUserNotifications(userId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const [data, total] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { notification: true },
      }),
      prisma.userNotification.count({ where: { userId } }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  }

  static async markRead(id: string, userId: string) {
    return prisma.userNotification.updateMany({ where: { id, userId }, data: { isRead: true, readAt: new Date() } });
  }

  static async markAllRead(userId: string) {
    return prisma.userNotification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.userNotification.count({ where: { userId, isRead: false } });
    return { unreadCount: count };
  }
}
