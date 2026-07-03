import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { globalLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes/api";
import { logger } from "./config/logger";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

app.use(cookieParser());
app.use(compression() as any);
app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom Parameter Pollution (HPP) mitigation
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1] as any;
      }
    }
  }
  next();
});

// Custom XSS Header protection
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
  app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);

const swaggerDoc = {
  openapi: "3.0.0",
  info: { title: "MakeEasyTrip API v2", version: "2.0.0", description: "Production REST API for MakeEasyTrip Booking Platform" },
  servers: [{ url: "/api", description: "API v2" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  },
  security: [{ bearerAuth: [] }],
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
