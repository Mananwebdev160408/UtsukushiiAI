/**
 * Form Validation Schemas — Zod schemas for client-side validation.
 */

import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ── Project ───────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).default('9:16'),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional(),
});

// ── Render Settings ───────────────────────────────────────────────────

export const renderSettingsSchema = z.object({
  quality: z.enum(['draft', 'standard', 'high', 'ultra']),
  fps: z.number().int().min(12).max(60),
  width: z.number().int().min(480).max(3840),
  height: z.number().int().min(480).max(3840),
  codec: z.enum(['libx264', 'libx265']),
  transition: z.string(),
  transitionDuration: z.number().min(0.1).max(3.0),
});

// ── Panel ─────────────────────────────────────────────────────────────

export const panelBBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

// ── Upload ────────────────────────────────────────────────────────────

export const MAX_FILE_SIZES = {
  manga: 100 * 1024 * 1024,  // 100MB
  audio: 50 * 1024 * 1024,   // 50MB
  image: 10 * 1024 * 1024,   // 10MB
};

export const ACCEPTED_MANGA_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
];

export function validateFile(
  file: File,
  type: 'manga' | 'audio' | 'image',
): { valid: boolean; error?: string } {
  const maxSize = MAX_FILE_SIZES[type];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  const accepted = type === 'audio' ? ACCEPTED_AUDIO_TYPES : ACCEPTED_MANGA_TYPES;
  if (!accepted.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Accepted: ${accepted.join(', ')}`,
    };
  }

  return { valid: true };
}

// ── Type exports ──────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type RenderSettingsInput = z.infer<typeof renderSettingsSchema>;
