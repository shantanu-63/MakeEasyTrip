import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3),
  type: z.enum(["HOTEL", "RESORT", "VILLA", "HOSTEL", "ACTIVITY", "TOUR"]),
  description: z.string().min(10),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().optional().default("India"),
  location: z.string().min(5),
  price: z.number().positive(),
  amenities: z.array(z.string()).optional().default([]),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional().default([]),
  destinationId: z.string().uuid().optional(),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]).optional(),
  duration: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  minAge: z.number().int().positive().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyQuerySchema = z.object({
  city: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  rating: z.string().optional(),
  amenities: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "rating_desc", "newest"]).optional(),
});
