// src/server.ts
import dotenv from "dotenv";
import app from "./app";
import { prisma } from "./config/db";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

let server: any;

async function bootstrap() {
  try {
    console.log("Checking database connectivity via Prisma ORM...");
    await prisma.$connect();
    console.log("Successfully connected to Supabase PostgreSQL database.");

    server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  MakeEasyTrip Full-Stack Server Started!        `);
      console.log(`  Port: ${PORT}                                  `);
      console.log(`  Health Check: http://localhost:${PORT}/health  `);
      console.log(`  Swagger UI Docs: http://localhost:${PORT}/api-docs `);
      console.log(`=================================================`);
    });
  } catch (err: any) {
    console.error("Database connection failed. Starting server in Mock Fallback mode...", err.message);
    
    server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  MakeEasyTrip Server Started (MOCK FALLBACK MODE)`);
      console.log(`  Port: ${PORT}                                  `);
      console.log(`  Health Check: http://localhost:${PORT}/health  `);
      console.log(`=================================================`);
    });
  }
}

bootstrap();

function shutdown() {
  console.log("SIGTERM/SIGINT received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      prisma.$disconnect().then(() => {
        console.log("Prisma disconnected.");
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export {};
