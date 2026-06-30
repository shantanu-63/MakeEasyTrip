import { Router } from "express";
import { verifyToken, checkRole, optionalToken } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

import * as auth from "../controllers/authController";
import * as dest from "../controllers/destinationController";
import * as prop from "../controllers/propertyController";
import * as booking from "../controllers/bookingController";
import * as review from "../controllers/reviewController";
import * as partner from "../controllers/partnerController";
import * as admin from "../controllers/adminController";
import * as notif from "../controllers/notificationController";
import * as support from "../controllers/supportController";

const router = Router();

router.post("/auth/register", authLimiter, auth.register);
router.post("/auth/login", authLimiter, auth.login);
router.get("/auth/me", verifyToken, auth.getProfile);
router.put("/auth/me", verifyToken, auth.updateProfile);
router.post("/auth/change-password", verifyToken, auth.changePassword);
router.delete("/auth/me", verifyToken, auth.deleteAccount);

router.get("/destinations", dest.getDestinations);
router.get("/destinations/:id", dest.getDestination);

router.get("/properties", prop.getProperties);
router.get("/properties/:id", prop.getProperty);
router.get("/properties/:propertyId/reviews", review.getPropertyReviews);

router.post("/bookings", verifyToken, checkRole(["CUSTOMER"]), booking.createBooking);
router.get("/bookings/my", verifyToken, booking.getMyBookings);
router.get("/bookings/:id", verifyToken, booking.getBookingById);
router.post("/bookings/:id/cancel", verifyToken, booking.cancelBooking);
router.post("/reviews", verifyToken, checkRole(["CUSTOMER"]), review.createReview);
router.get("/notifications", verifyToken, notif.getMyNotifications);
router.get("/notifications/unread-count", verifyToken, notif.getUnreadCount);
router.patch("/notifications/:id/read", verifyToken, notif.markRead);
router.post("/notifications/mark-all-read", verifyToken, notif.markAllRead);
router.post("/support/tickets", verifyToken, support.createTicket);
router.get("/support/tickets", verifyToken, support.getMyTickets);
router.get("/support/tickets/:id", verifyToken, support.getTicket);
router.post("/support/tickets/:ticketId/messages", verifyToken, support.addMessage);

router.post("/partner/onboard", verifyToken, partner.onboardPartner);
router.get("/partner/profile", verifyToken, checkRole(["PARTNER"]), partner.getPartnerProfile);
router.put("/partner/profile", verifyToken, checkRole(["PARTNER"]), partner.updatePartnerProfile);
router.get("/partner/dashboard", verifyToken, checkRole(["PARTNER"]), partner.getPartnerDashboard);
router.get("/partner/revenue", verifyToken, checkRole(["PARTNER"]), partner.getPartnerRevenue);
router.get("/partner/properties", verifyToken, checkRole(["PARTNER"]), partner.getPartnerProperties);
router.post("/partner/properties", verifyToken, checkRole(["PARTNER"]), partner.addProperty);
router.put("/partner/properties/:id", verifyToken, checkRole(["PARTNER"]), partner.updateProperty);
router.delete("/partner/properties/:id", verifyToken, checkRole(["PARTNER"]), partner.deleteProperty);
router.get("/partner/rooms", verifyToken, checkRole(["PARTNER"]), partner.getRooms);
router.post("/partner/rooms", verifyToken, checkRole(["PARTNER"]), partner.addRoom);
router.delete("/partner/rooms/:id", verifyToken, checkRole(["PARTNER"]), partner.deleteRoom);
router.get("/partner/bookings", verifyToken, checkRole(["PARTNER"]), partner.getPartnerBookings);
router.patch("/partner/bookings/:id/status", verifyToken, checkRole(["PARTNER"]), partner.verifyBookingStatus);
router.post("/partner/reviews/reply", verifyToken, checkRole(["PARTNER"]), partner.replyToReview);

const ADMIN = checkRole(["ADMIN"]);
router.get("/admin/dashboard", verifyToken, ADMIN, admin.getDashboard);
router.get("/admin/users", verifyToken, ADMIN, admin.getUsers);
router.put("/admin/users/:id", verifyToken, ADMIN, admin.updateUser);
router.delete("/admin/users/:id", verifyToken, ADMIN, admin.deleteUser);
router.get("/admin/partners", verifyToken, ADMIN, admin.getPartners);
router.post("/admin/partners/:id/approve", verifyToken, ADMIN, admin.approvePartner);
router.post("/admin/partners/:id/reject", verifyToken, ADMIN, admin.rejectPartner);
router.get("/admin/approvals", verifyToken, ADMIN, admin.getPendingApprovals);
router.post("/admin/properties/:id/approve", verifyToken, ADMIN, admin.approveProperty);
router.post("/admin/properties/:id/reject", verifyToken, ADMIN, admin.rejectProperty);
router.get("/admin/bookings", verifyToken, ADMIN, booking.adminGetAllBookings);
router.get("/admin/reviews", verifyToken, ADMIN, review.adminGetAllReviews);
router.patch("/admin/reviews/:id/status", verifyToken, ADMIN, review.adminUpdateReviewStatus);
router.get("/admin/support", verifyToken, ADMIN, support.adminGetTickets);
router.patch("/admin/support/:id", verifyToken, ADMIN, support.adminUpdateTicket);
router.get("/admin/reports", verifyToken, ADMIN, admin.getReports);
router.get("/admin/cms/banners", admin.getCmsBanners);
router.get("/admin/cms/banners/all", verifyToken, ADMIN, admin.getAllBanners);
router.post("/admin/cms/banners", verifyToken, ADMIN, admin.createBanner);
router.put("/admin/cms/banners/:id", verifyToken, ADMIN, admin.updateBanner);
router.delete("/admin/cms/banners/:id", verifyToken, ADMIN, admin.deleteBanner);
router.post("/admin/notifications/broadcast", verifyToken, ADMIN, admin.sendBroadcastNotification);
router.get("/admin/stats", verifyToken, ADMIN, admin.getAdminStats);
router.get("/admin/reports/telemetry", verifyToken, ADMIN, admin.getReportsTelemetry);

export default router;
