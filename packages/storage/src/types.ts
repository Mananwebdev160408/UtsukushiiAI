export interface FileUploadResult {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface StorageOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
}
