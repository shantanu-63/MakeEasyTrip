import { z } from "zod";

export const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  roomId: z.string().uuid().optional(),
  checkIn: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid check-in date"),
  checkOut: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid check-out date"),
  guests: z.number().int().min(1).max(20),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  specialRequests: z.string().optional(),
}).refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
  message: "Check-out must be after check-in",
  path: ["checkOut"],
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(5).optional(),
});
