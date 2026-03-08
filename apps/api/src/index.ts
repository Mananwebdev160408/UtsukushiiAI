import { config } from "./config";
import { connectDB } from "./database/connection";
import { logger } from "./utils/logger";
import { createServer } from "http";
import { initWebSocket } from "./services/websocketService";
import app from "./app";

const startServer = async () => {
  try {
    await connectDB(config.mongodb.uri);

    const httpServer = createServer(app);
    initWebSocket(httpServer);

    httpServer.listen(config.port, () => {
      logger.info(
        `Server running on port ${config.port} in ${config.nodeEnv} mode`,
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
