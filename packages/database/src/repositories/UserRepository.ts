import { User, IUser } from "../models/User";
import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select("+password");
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.model.findOne({ username });
  }
}

export const userRepository = new UserRepository();
