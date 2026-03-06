import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      requestId?: string;
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }
}

export {};
