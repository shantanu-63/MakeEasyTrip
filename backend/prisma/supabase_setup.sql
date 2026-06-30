-- supabase_setup.sql
-- Run this in your Supabase SQL editor to initialize tables and seed data.

-- 1. Create Enums if they do not exist
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'PARTNER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReviewStatus" AS ENUM ('APPROVED', 'FLAGGED', 'REMOVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "visaInfo" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "amenities" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "images" TEXT,
    "difficulty" TEXT,
    "duration" TEXT,
    "maxGuests" INTEGER,
    "partnerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "destinationId" TEXT REFERENCES "Destination"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL REFERENCES "Property"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "maxOccupancy" INTEGER NOT NULL,
    "amenities" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "propertyId" TEXT NOT NULL REFERENCES "Property"("id") ON DELETE CASCADE,
    "roomId" TEXT REFERENCES "Room"("id") ON DELETE SET NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "method" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "propertyId" TEXT NOT NULL REFERENCES "Property"("id") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
    "replyText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL REFERENCES "SupportTicket"("id") ON DELETE CASCADE,
    "senderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CmsBanner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "SystemNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Preload Seed Data
-- Seed Default Users (Passwords are hashed for 'Admin@2026' and 'Partner@123')
INSERT INTO "User" ("id", "email", "password", "fullName", "phone", "role") VALUES
('user-admin-1', 'admin@makeeasytrip.com', '$2a$10$i2/W4wY5i.hH2.m39U1qMewuJdpx.0.GvFp3w9D3v220zG12n8eS6', 'MakeEasyTrip Super Admin', '9876543210', 'ADMIN')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "User" ("id", "email", "password", "fullName", "phone", "role") VALUES
('user-partner-1', 'rajesh@sunsetvilla.com', '$2a$10$w0Uj4Z75c7w7Vl98i8k6eexY06pE15M2z220zG12n8eS6aB5hNGeu', 'Rajesh Sharma', '9876543211', 'PARTNER')
ON CONFLICT ("email") DO NOTHING;

-- Seed Destinations
INSERT INTO "Destination" ("id", "name", "country", "season", "visaInfo", "budget", "description", "highlights", "imageUrl") VALUES
('dest-1', 'Goa', 'India', 'November to February', 'Visa on Arrival / eVisa', 'Moderate', 'Goa is famous for its beaches, historic Portuguese buildings, spice farms, and dynamic coastal nightlife.', 'Calangute Beach, Dudhsagar Falls, Basilica of Bom Jesus, Anjuna Flea Market', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
('dest-2', 'Bali', 'Indonesia', 'April to October', 'Visa on Arrival (30 Days)', 'Moderate', 'Bali offers forested volcanic mountains, iconic rice paddies, beaches, coral reefs, and ancient Hindu shrines.', 'Ubud Monkey Forest, Uluwatu Temple, Mount Batur Active Volcano, Seminyak Beaches', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'),
('dest-3', 'Tokyo', 'Japan', 'March to May & September to November', 'Visa Required (eVisa available)', 'Premium', 'Tokyo blends ultra-modern skyscrapers with historic temples, anime hubs, sushi markets, and shopping strips.', 'Shibuya Crossing, Senso-ji Temple, Tokyo Skytree, Akihabara Electric Town', 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80'),
('dest-4', 'Paris', 'France', 'June to August & September to October', 'Schengen Visa Required', 'Premium', 'Paris is a global hub for art, fashion, gastronomy, and culture, framed by its 19th-century cityscape.', 'Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, Seine River Cruises', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80')
ON CONFLICT ("id") DO NOTHING;

-- Seed Properties (Hotels)
INSERT INTO "Property" ("id", "name", "type", "description", "city", "location", "price", "rating", "amenities", "imageUrl", "images", "partnerId", "destinationId") VALUES
('prop-hotel-1', 'Sunset Beach Villa', 'villa', 'Luxurious beachfront villa featuring private infinity pools, wellness therapies, and chef services.', 'Goa', 'Candolim Beach, Goa', 15000.0, 4.8, 'Free WiFi, Swimming Pool, Ocean View, Wellness Spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'user-partner-1', 'dest-1'),
('prop-hotel-2', 'Ocean Palms Resort', 'resort', 'Pristine ocean side resort with family pools, dining decks, and water activities.', 'Goa', 'Calangute, Goa', 8500.0, 4.5, 'Free WiFi, Swimming Pool, Ocean View, Breakfast', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'user-partner-1', 'dest-1'),
('prop-hotel-3', 'Ubud Jungle Lodge', 'hotel', 'Stunning resort nestled in Ubud tropical forests with hanging pools and organic spas.', 'Bali', 'Ubud, Bali', 12000.0, 4.7, 'Free WiFi, Swimming Pool, Forest View, Organic Dining', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 'user-partner-1', 'dest-2')
ON CONFLICT ("id") DO NOTHING;

-- Seed Rooms
INSERT INTO "Room" ("id", "propertyId", "type", "price", "maxOccupancy", "amenities") VALUES
('room-1', 'prop-hotel-1', 'Deluxe Villa Suite', 15000.0, 2, 'Free WiFi, King Bed, Ocean View, Mini Bar'),
('room-2', 'prop-hotel-1', 'Presidential Suite', 25000.0, 4, 'Free WiFi, Private Pool, Butler Service, Kitchen'),
('room-3', 'prop-hotel-2', 'Standard Room', 8500.0, 2, 'Free WiFi, Queen Bed, Garden View'),
('room-4', 'prop-hotel-3', 'Jungle View Cabin', 12000.0, 2, 'Free WiFi, Balcony, Forest Spa')
ON CONFLICT ("id") DO NOTHING;

-- Seed Activities
INSERT INTO "Property" ("id", "name", "type", "description", "city", "location", "price", "rating", "amenities", "imageUrl", "difficulty", "duration", "maxGuests", "partnerId", "destinationId") VALUES
('prop-act-1', 'Grande Island Scuba Diving', 'activity', 'Explore the underwater reefs of Goa with certified PADI divers.', 'Goa', 'Grande Island, Goa', 3500.0, 4.9, 'Professional Instructor, Equipment Included, Boat Transfers, Underwater Photo', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 'Moderate', '4 Hours', 12, 'user-partner-1', 'dest-1'),
('prop-act-2', 'Bali Traditional Cooking Class', 'activity', 'Learn the secrets of Balinese organic cuisines with local master chefs.', 'Bali', 'Ubud, Bali', 2200.0, 4.7, 'English Guide, Ingredients Included, Lunch, Recipe Booklet', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', 'Easy', '3 Hours', 8, 'user-partner-1', 'dest-2')
ON CONFLICT ("id") DO NOTHING;

-- Seed CMS Banners
INSERT INTO "CmsBanner" ("id", "title", "subtitle", "imageUrl", "ctaText", "ctaLink", "displayOrder", "status", "type") VALUES
('banner-1', 'Escape to Goa Beachfronts', 'Get flat 25% off vouchers on premium partner villas. CODE: EASYGOA', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Explore Stays', '/customer/hotels?city=Goa', 1, 'Published', 'Offer'),
('banner-2', 'Adventure in Bali Jungles', 'Hike active volcanoes and book eco-spas with 20% off. CODE: BALI20', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', 'Find Experiences', '/customer/activities?city=Bali', 2, 'Published', 'Offer')
ON CONFLICT ("id") DO NOTHING;
