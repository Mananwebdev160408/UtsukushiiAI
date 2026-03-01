import { User, IUser } from "../models/User";
import { Document } from "mongoose";

export class BaseRepository<T extends Document> {
  protected model: mongoose.Model<T>;

  constructor(model: mongoose.Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: any): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}

import mongoose from "mongoose";
