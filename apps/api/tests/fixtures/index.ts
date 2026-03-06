import mongoose from "mongoose";

export const createMockUserOptions = (overrides = {}) => {
  return {
    email: "testuser@example.com",
    password: "password123" /* Needs to be hashed before saving */,
    name: "Test User",
    _id: new mongoose.Types.ObjectId(),
    ...overrides,
  };
};

export const createMockProjectOptions = (overrides = {}) => {
  return {
    title: "Test Manga Project",
    type: "manga",
    userId: new mongoose.Types.ObjectId(),
    _id: new mongoose.Types.ObjectId(),
    status: "processing",
    ...overrides,
  };
};
