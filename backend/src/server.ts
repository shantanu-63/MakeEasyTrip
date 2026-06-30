// src/server.ts
import dotenv from "dotenv";
import app from "./app";
import { prisma } from "./config/db";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Verify database connectivity
    console.log("Checking database connectivity via Prisma ORM...");
    await prisma.$connect();
    console.log("Successfully connected to Supabase PostgreSQL database.");

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  MakeEasyTrip Full-Stack Server Started!        `);
      console.log(`  Port: ${PORT}                                  `);
      console.log(`  Health Check: http://localhost:${PORT}/health  `);
      console.log(`  Swagger UI Docs: http://localhost:${PORT}/api-docs `);
      console.log(`=================================================`);
    });
  } catch (err: any) {
    console.error("Database connection failed. Starting server in Mock Fallback mode...", err.message);
    
    // Start server in fallback mode (still listen so frontend doesn't crash)
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  MakeEasyTrip Server Started (MOCK FALLBACK MODE)`);
      console.log(`  Port: ${PORT}                                  `);
      console.log(`  Health Check: http://localhost:${PORT}/health  `);
      console.log(`=================================================`);
    });
  }
}

bootstrap();
export {};
