import mongoose from "mongoose";
import { config } from "../../config";
import { seedUsers } from "./userSeeder";
import { logger } from "../../utils/logger";

const runSeeders = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info("Connected to database. Starting seeders...");

    await seedUsers();

    logger.info("All seeders completed successfully.");
    process.exit(0);
  } catch (error) {
    logger.error("Seeding failed:", error);
    process.exit(1);
  }
};

runSeeders();
