# MakeEasyTrip - Full-Stack Travel Booking Platform

MakeEasyTrip is a complete, production-ready travel booking platform featuring Customer booking workflows, Partner merchant hubs, and Super Admin control panels. 

---

## 1. Project Directory Structure

```text
makeeasytrip/
├── frontend/             # Next.js App Router Frontend
│   ├── src/
│   │   ├── app/          # Customer, Partner, and Admin pages
│   │   ├── components/   # Modular UI, layouts, and forms
│   │   ├── context/      # React Context (DataContext for API sync)
│   │   ├── lib/          # Supabase client instantiation
│   │   ├── styles/       # Consolidated global CSS stylesheets
│   │   └── types/        # Common TypeScript interfaces
│   ├── public/           # SVGs, icons, and logo assets
│   ├── package.json      # Frontend package manifest
│   └── tsconfig.json     # Path mapping options
│
├── backend/              # Node.js + Express API Server
│   ├── src/
│   │   ├── controllers/  # API route business logic
│   │   ├── routes/       # Express route definitions
│   │   ├── middleware/   # Authentication & role validation guards
│   │   ├── config/       # Database pool configurations
│   │   ├── utils/        # Razorpay payments and Nodemailer SMTP helpers
│   │   ├── app.ts        # App setup & Swagger binding
│   │   └── server.ts     # Listener entry point
│   ├── prisma/
│   │   ├── schema.prisma # PostgreSQL relational models
│   │   └── supabase_setup.sql # Database migration SQL script
│   ├── package.json      # Backend package manifest
│   └── tsconfig.json     # TS compilation options
│
└── README.md             # Running & deployment guides (This file)
```

---

## 2. API Documentation Specifications

The backend Express server has complete built-in API documentation served dynamically through **Swagger UI**.

* **Access link**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
* **API endpoints mapped**:
  * **Auth**: `/api/auth/register` (POST), `/api/auth/login` (POST), `/api/auth/me` (GET)
  * **Customer**: `/api/destinations` (GET), `/api/properties` (GET), `/api/bookings` (POST), `/api/bookings/verify` (POST), `/api/reviews` (POST), `/api/support/ticket` (POST)
  * **Partner**: `/api/partner/dashboard` (GET), `/api/partner/properties` (GET/POST), `/api/partner/rooms` (GET/POST), `/api/partner/bookings` (GET), `/api/partner/reviews/reply` (POST)
  * **Super Admin**: `/api/admin/stats` (GET), `/api/admin/users` (GET/DELETE), `/api/admin/approvals` (GET), `/api/admin/cms/banners` (GET/POST), `/api/admin/reports/telemetry` (GET)

---

## 3. Database Configurations (Supabase PostgreSQL)

MakeEasyTrip uses **Supabase PostgreSQL** as its primary relational database. 

### Seeding tables in Supabase:
1. Open the [Supabase Dashboard](https://supabase.com/).
2. Navigate to the **SQL Editor** tab.
3. Copy the entire contents of [supabase_setup.sql](file:///c:/Users/patil/OneDrive/Desktop/met/backend/prisma/supabase_setup.sql) and paste it into the editor.
4. Click **Run** to generate User, Destination, Property, Room, Booking, Payment, Review, Tickets, and CMS banner tables preloaded with default mock seed parameters.

---

## 4. Run & Development Server Setup

Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Launch the Backend Server
Navigate to the `backend/` directory:
```bash
cd backend
npm install
npm run dev
```
*The server will boot on [http://localhost:5000](http://localhost:5000). If no PostgreSQL connection is defined, it will fall back automatically to a robust Mock emulation mode so the application remains functional offline.*

### 2. Launch the Frontend Website
Navigate to the `frontend/` directory:
```bash
cd ../frontend
npm install
npm run dev
```
*The website will boot on [http://localhost:3000](http://localhost:3000).*

---

## 5. Production & Deploy Checklist

- [ ] **SSL & Certificate setup**: Ensure HTTPS is enforced via DNS settings or cloud load balancers.
- [ ] **Secrets & Keys rotation**: Replace placeholder keys in `.env` with real credentials:
  - `DATABASE_URL` (Supabase pooler connection string)
  - `JWT_SECRET` (A strong random hash)
  - `SMTP_USER` & `SMTP_PASS` (Your mail delivery provider)
  - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` (Live transaction accounts keys)
- [ ] **Prisma Migrations**: Execute `npx prisma migrate deploy` to synchronize the schema.
- [ ] **Next.js Optimize Build**: Run `npm run build` inside `frontend/` to generate optimized production page chunks.
