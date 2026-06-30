import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MakeEasyTrip database...");

  const adminHash = await bcrypt.hash("Admin@2026", 12);
  const partnerHash = await bcrypt.hash("Partner@123", 12);
  const customerHash = await bcrypt.hash("Customer@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@makeeasytrip.com" },
    update: {},
    create: { email: "admin@makeeasytrip.com", passwordHash: adminHash, fullName: "Super Admin", role: "ADMIN", isActive: true, isVerified: true },
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: "rajesh@sunsetvilla.com" },
    update: {},
    create: { email: "rajesh@sunsetvilla.com", passwordHash: partnerHash, fullName: "Rajesh Kumar", role: "PARTNER", phone: "+91 98765 11111", isActive: true },
  });

  const customer = await prisma.user.upsert({
    where: { email: "siddharth.patil@gmail.com" },
    update: {},
    create: { email: "siddharth.patil@gmail.com", passwordHash: customerHash, fullName: "Siddharth Patil", role: "CUSTOMER", phone: "+91 98765 43210", isActive: true },
  });

  console.log("✅ Users seeded");

  const partner = await prisma.partner.upsert({
    where: { userId: partnerUser.id },
    update: {},
    create: {
      userId: partnerUser.id,
      businessName: "Sunset Villa Resorts",
      partnerType: "HOTELIER",
      ownerName: "Rajesh Kumar",
      mobileNumber: "+91 98765 11111",
      businessAddress: "Calangute Beach Road, North Goa",
      city: "Goa",
      state: "Goa",
      country: "India",
      pincode: "403516",
      status: "APPROVED",
      verificationLevel: 2,
      approvedAt: new Date(),
    },
  });
  console.log("✅ Partner seeded");

  const destinations = [
    { id: "dest-1", name: "Goa, India", country: "India", city: "Goa", season: "October to March", budget: "Budget", description: "Goa is India's smallest state, known for its pristine beaches, vibrant nightlife, and Portuguese heritage.", highlights: ["Calangute Beach", "Anjuna Flea Market", "Dudhsagar Falls", "Fort Aguada", "Spice Plantations"], thumbnail: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"], rating: 4.6, ratingCount: 2840 },
    { id: "dest-2", name: "Bali, Indonesia", country: "Indonesia", city: "Bali", season: "April to October", budget: "Moderate", description: "Bali is a living postcard, an Indonesian paradise that feels like a fantasy.", highlights: ["Ubud Monkey Forest", "Tanah Lot Temple", "Tegallalang Rice Terraces", "Seminyak Beach", "Kuta Nightlife"], thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"], rating: 4.8, ratingCount: 5620 },
    { id: "dest-3", name: "Udaipur, India", country: "India", city: "Udaipur", season: "September to March", budget: "Moderate", description: "Udaipur, also known as the City of Lakes, is a city in the state of Rajasthan, India.", highlights: ["City Palace", "Lake Pichola", "Jag Mandir", "Fateh Sagar Lake", "Vintage Car Museum"], thumbnail: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"], rating: 4.7, ratingCount: 3150 },
    { id: "dest-4", name: "Tokyo, Japan", country: "Japan", city: "Tokyo", season: "March to May", budget: "Luxury", description: "Tokyo, Japan's busy capital, mixes the ultramodern and the traditional.", highlights: ["Shinjuku", "Shibuya Crossing", "Senso-ji Temple", "Tokyo Skytree", "Harajuku"], thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80"], rating: 4.9, ratingCount: 7200 },
    { id: "dest-5", name: "Kerala, India", country: "India", city: "Kerala", season: "September to March", budget: "Budget", description: "Kerala is known for its palmlined beaches, backwaters and hill stations.", highlights: ["Alleppey Backwaters", "Munnar Tea Gardens", "Kovalam Beach", "Periyar Wildlife", "Thrissur Pooram"], thumbnail: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"], rating: 4.7, ratingCount: 4100 },
    { id: "dest-6", name: "Paris, France", country: "France", city: "Paris", season: "April to June", budget: "Luxury", description: "Paris, France's capital, is a major European city and a global center for art, fashion, and gastronomy.", highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Champs-Élysées", "Versailles"], thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"], rating: 4.8, ratingCount: 9800 },
    { id: "dest-7", name: "Jaipur, India", country: "India", city: "Jaipur", season: "October to March", budget: "Budget", description: "Jaipur is the capital of India's Rajasthan state. It evokes the royal family that once ruled the region.", highlights: ["Hawa Mahal", "Amber Fort", "City Palace", "Jantar Mantar", "Nahargarh Fort"], thumbnail: "https://images.unsplash.com/photo-1477587458883-47145ed31459?auto=format&fit=crop&w=800&q=80", gallery: ["https://images.unsplash.com/photo-1477587458883-47145ed31459?auto=format&fit=crop&w=800&q=80"], rating: 4.6, ratingCount: 3700 },
  ];

  for (const d of destinations) {
    await prisma.destination.upsert({
      where: { id: d.id },
      update: {},
      create: d as any,
    });
  }
  console.log("✅ Destinations seeded");

  const properties = [
    { id: "prop-1", title: "Sunset Beach Villa", type: "VILLA", description: "A stunning beachfront villa with private pool and panoramic sea views.", city: "Goa", state: "Goa", country: "India", location: "Calangute Beach, North Goa", price: 8500, rating: 4.8, ratingCount: 124, amenities: ["Pool", "WiFi", "AC", "Beach Access", "Parking", "Breakfast"], image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", isFeatured: true, partnerId: partner.id, destinationId: "dest-1" },
    { id: "prop-2", title: "Heritage Haveli Udaipur", type: "HOTEL", description: "Experience royal Rajasthani hospitality in a restored 18th century haveli.", city: "Udaipur", state: "Rajasthan", country: "India", location: "Old City, Udaipur", price: 6200, rating: 4.9, ratingCount: 89, amenities: ["WiFi", "AC", "Room Service", "Rooftop Restaurant", "Heritage Tours"], image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", partnerId: partner.id, destinationId: "dest-3" },
    { id: "prop-3", title: "Kerala Backwater Houseboat", type: "RESORT", description: "Cruise the serene backwaters of Alleppey on a traditional Kerala kettuvallam.", city: "Kerala", state: "Kerala", country: "India", location: "Alleppey Backwaters", price: 9800, rating: 4.7, ratingCount: 67, amenities: ["All Meals", "AC", "Wifi", "Guided Tour", "Fishing"], image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", partnerId: partner.id, destinationId: "dest-5" },
    { id: "prop-4", title: "Tokyo Capsule Inn", type: "HOSTEL", description: "Modern capsule hotel in the heart of Shinjuku, walking distance from all major attractions.", city: "Tokyo", state: "Tokyo", country: "Japan", location: "Shinjuku, Tokyo", price: 3200, rating: 4.5, ratingCount: 215, amenities: ["WiFi", "Locker", "Shared Bath", "24hr Reception"], image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", partnerId: partner.id, destinationId: "dest-4" },
    { id: "prop-5", title: "Bali Jungle Eco Resort", type: "RESORT", description: "Luxurious eco-resort nestled in the Ubud jungle with infinity pool and spa.", city: "Bali", state: "Bali", country: "Indonesia", location: "Ubud, Bali", price: 12000, rating: 4.9, ratingCount: 198, amenities: ["Infinity Pool", "Spa", "Yoga", "Breakfast", "Airport Transfer"], image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", isFeatured: true, partnerId: partner.id, destinationId: "dest-2" },
    { id: "act-1", title: "Scuba Diving in Goa", type: "ACTIVITY", description: "Explore vibrant coral reefs and marine life with PADI certified instructors.", city: "Goa", state: "Goa", country: "India", location: "Grande Island, Goa", price: 2500, rating: 4.7, ratingCount: 320, amenities: ["Equipment Provided", "Certified Instructors", "Photos Included"], image: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", difficulty: "Easy", duration: "3 hours", maxGuests: 8, minAge: 10, partnerId: partner.id, destinationId: "dest-1" },
    { id: "act-2", title: "Bali Sunrise Trek", type: "ACTIVITY", description: "Trek to the summit of Mount Batur for a breathtaking sunrise experience.", city: "Bali", state: "Bali", country: "Indonesia", location: "Mount Batur, Bali", price: 1800, rating: 4.8, ratingCount: 445, amenities: ["Guide", "Breakfast", "Transport", "Headlamp"], image: "https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", difficulty: "Moderate", duration: "6 hours", maxGuests: 12, minAge: 12, partnerId: partner.id, destinationId: "dest-2" },
    { id: "act-3", title: "Jaipur Heritage City Tour", type: "TOUR", description: "Full-day guided tour of Jaipur's iconic landmarks including Amber Fort and City Palace.", city: "Jaipur", state: "Rajasthan", country: "India", location: "Jaipur City", price: 1500, rating: 4.6, ratingCount: 187, amenities: ["Guide", "AC Vehicle", "Entry Tickets", "Lunch"], image: "https://images.unsplash.com/photo-1477587458883-47145ed31459?auto=format&fit=crop&w=800&q=80", images: [], status: "APPROVED", difficulty: "Easy", duration: "8 hours", maxGuests: 20, minAge: 5, partnerId: partner.id, destinationId: "dest-7" },
  ];

  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: {},
      create: p as any,
    });
  }
  console.log("✅ Properties seeded");

  const rooms = [
    { id: "room-1", propertyId: "prop-1", name: "Ocean Suite", type: "SUITE", description: "Luxurious suite with private balcony and ocean view", price: 8500, maxOccupancy: 2, bedCount: 1, bathCount: 1, amenities: ["King Bed", "Ocean View", "Mini Bar", "Jacuzzi"], images: [], isAvailable: true, totalCount: 3 },
    { id: "room-2", propertyId: "prop-1", name: "Garden Villa", type: "VILLA", description: "Spacious villa with private garden and plunge pool", price: 12000, maxOccupancy: 4, bedCount: 2, bathCount: 2, amenities: ["Private Pool", "Garden", "Full Kitchen", "Dining Area"], images: [], isAvailable: true, totalCount: 2 },
    { id: "room-3", propertyId: "prop-2", name: "Royal Chamber", type: "DELUXE", description: "Heritage-themed deluxe room with antique furniture", price: 6200, maxOccupancy: 2, bedCount: 1, bathCount: 1, amenities: ["Heritage Decor", "AC", "Room Service", "Lake View"], images: [], isAvailable: true, totalCount: 5 },
    { id: "room-4", propertyId: "prop-5", name: "Jungle Loft", type: "SUITE", description: "Treehouse-style suite overlooking the Ubud jungle", price: 12000, maxOccupancy: 2, bedCount: 1, bathCount: 1, amenities: ["Jungle View", "Private Deck", "Outdoor Shower", "Breakfast"], images: [], isAvailable: true, totalCount: 4 },
  ];

  for (const r of rooms) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: {},
      create: r as any,
    });
  }
  console.log("✅ Rooms seeded");

  const banners = [
    { id: "ban-1", title: "Escape to Paradise", subtitle: "Discover secret beaches with exclusive 25% off. CODE: EASYGOA", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", ctaText: "Explore Stays", ctaLink: "/customer/hotels?city=Goa", displayOrder: 1, status: "Published", type: "Seasonal Banner" },
    { id: "ban-2", title: "Explore Cultural Heritage", subtitle: "Immerse in history with private city guides. CODE: JAIPUR15", imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80", ctaText: "Explore Stays", ctaLink: "/customer/hotels?city=Jaipur", displayOrder: 2, status: "Published", type: "Cultural Tour" },
    { id: "ban-3", title: "Alpine Adventure Awaits", subtitle: "Hike through lush valleys and mountains. CODE: ESCAPE20", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", ctaText: "Find Activities", ctaLink: "/customer/activities?city=Manali", displayOrder: 3, status: "Published", type: "Adventure Deal" },
  ];

  for (const b of banners) {
    await prisma.cmsBanner.upsert({
      where: { id: b.id },
      update: {},
      create: b as any,
    });
  }
  console.log("✅ CMS Banners seeded");

  await prisma.booking.upsert({
    where: { id: "booking-1" },
    update: {},
    create: {
      id: "booking-1",
      bookingRef: "MET-2026-001",
      userId: customer.id,
      propertyId: "prop-1",
      roomId: "room-1",
      checkIn: new Date("2026-07-10"),
      checkOut: new Date("2026-07-15"),
      nights: 5,
      guests: 2,
      guestName: "Siddharth Patil",
      guestEmail: "siddharth.patil@gmail.com",
      guestPhone: "+91 98765 43210",
      baseAmount: 42500,
      taxAmount: 7650,
      totalAmount: 50150,
      status: "CONFIRMED",
    },
  });
  console.log("✅ Sample booking seeded");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
