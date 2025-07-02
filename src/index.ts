import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { setupSwagger } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import eosbRoutes from "./routes/eosbRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests",
    message: "Rate limit exceeded. Please try again later.",
  },
});
app.use("/api", limiter);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use("/api/eosb", eosbRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "UAE EOSB Calculator API",
    version: "1.0.0",
    documentation: {
      swagger: "/api-docs",
      openapi: "/api-docs.json",
    },
    endpoints: {
      health: "/api/eosb/health",
      config: "/api/eosb/config",
      calculate: "/api/eosb/calculate",
    },
    features: [
      "✅ Accurate EOSB calculations with corrected formula",
      "✅ Proper daily wage calculation: (Monthly Salary ÷ 30) × Eligible Days",
      "✅ Precise service period calculation using calendar dates",
      "✅ Resignation penalties for unlimited contracts only",
      "✅ Comprehensive API documentation with Swagger",
    ],
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`📋 OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/eosb/health`);
    console.log(`⚙️ Configuration: http://localhost:${PORT}/api/eosb/config`);
    console.log(
      `🧮 EOSB Calculator: http://localhost:${PORT}/api/eosb/calculate`
    );
  });
}

export default app;
