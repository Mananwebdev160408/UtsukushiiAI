import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler, limiter } from "./middleware";
import routes from "./routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(morgan(config.isDev ? "dev" : "combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Static File Serving
app.use("/uploads", express.static(config.storage.path));

// API Routes
app.use("/v1", limiter);
app.use("/v1", routes);

// Error Handling
app.use(errorHandler);

export default app;
