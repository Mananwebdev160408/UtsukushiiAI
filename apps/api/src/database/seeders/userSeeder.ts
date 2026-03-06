import mongoose from "mongoose";
import { User } from "../../../../../packages/database/src/models/User";
import { config } from "../../config";
import { hashPassword } from "../../utils/password";
import { logger } from "../../utils/logger";

export const seedUsers = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@utsukushii.ai" });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("admin123");
      await User.create({
        email: "admin@utsukushii.ai",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      });
      logger.info("Admin user seeded.");
    } else {
      logger.info("Admin user already exists.");
    }
  } catch (err) {
    logger.error("Failed to seed users:", err);
  }
};
