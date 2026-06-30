// frontend/src/types/index.ts
// Consolidated type definitions — no cross-package relative paths

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "traveler" | "partner" | "admin";
  wishlist?: string[];
  bookings?: string[];
}

export interface Property {
  id: string;
  title: string;
  type: "hotel" | "activity" | "resort";
  status: "Pending" | "Approved" | "Rejected" | "Suspended";
  city: string;
  location?: string;
  price: number;
  rating?: number;
  image?: string;
  images?: string[];
  partnerId?: string;
  destinationId?: string;
  [key: string]: unknown;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  capacity: number;
  price: number;
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  totalAmount: number;
  guests?: number;
  guestName?: string;
  guestEmail?: string;
  paymentStatus?: "Pending" | "Paid" | "Refunded";
  createdAt?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  description?: string;
  thumbnail?: string;
  gallery?: string[];
  rating?: number;
  ratingCount?: number;
  budget?: string;
  season?: string;
  visa?: string;
  highlights?: string[];
  reviews?: Review[];
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface PartnerProfile {
  id: string;
  businessName: string;
  partnerType: "hotelier" | "activity_provider" | "travel_agencies";
  ownerName: string;
  email: string;
  mobileNumber: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  verificationLevel: number;
  status: "Pending" | "Approved" | "Suspended";
}

// Backwards compatibility aliases
export type UserProfile = User;
export type PropertyListing = Property;
export type RoomDetails = Room;
export type BookingRecord = Booking;
