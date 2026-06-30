// shared/types.ts

export type UserRole = "CUSTOMER" | "PARTNER" | "ADMIN";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type ReviewStatus = "APPROVED" | "FLAGGED" | "REMOVED";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  season: string;
  visaInfo: string;
  budget: string;
  description: string;
  highlights: string; // Comma separated
  imageUrl: string;
}

export interface Property {
  id: string;
  name: string;
  type: string; // hotel, resort, villa, activity
  description: string;
  city: string;
  location: string;
  price: number;
  rating: number;
  amenities: string; // Comma separated
  imageUrl: string;
  images?: string | null;
  
  // Activity Specific Fields
  difficulty?: string | null;
  duration?: string | null;
  maxGuests?: number | null;
  
  partnerId: string;
  destinationId?: string | null;
}

export interface Room {
  id: string;
  propertyId: string;
  type: string;
  price: number;
  maxOccupancy: number;
  amenities: string;
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  roomId?: string | null;
  checkIn: string | Date;
  checkOut: string | Date;
  guests: number;
  amount: number;
  status: BookingStatus;
  createdAt: string | Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  amount: number;
  status: string;
  method?: string | null;
  invoiceUrl?: string | null;
  createdAt: string | Date;
}

export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  replyText?: string | null;
  createdAt: string | Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: string;
  status: TicketStatus;
  createdAt: string | Date;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  text: string;
  createdAt: string | Date;
}

export interface CmsBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText?: string | null;
  ctaLink?: string | null;
  displayOrder: number;
  status: string;
  type: string;
}

export interface AuditLog {
  id: string;
  timestamp: string | Date;
  actorType: string;
  actorId: string;
  actionType: string;
  description: string;
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  targetRole: string;
  type: string;
  sentAt: string | Date;
}
