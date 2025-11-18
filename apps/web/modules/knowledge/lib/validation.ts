import { z } from "zod";

/**
 * Validation Schemas for Knowledge Base
 * Zod schemas for form validation and type safety
 */

// Supported file types for upload
export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Schema for document upload
 */
export const documentUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, "File is required")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => SUPPORTED_FILE_TYPES.includes(file.type as any),
      "File type not supported. Please upload PDF, TXT, MD, or DOC files"
    ),
  title: z.string().optional(),
});

/**
 * Schema for document update
 */
export const documentUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().optional(),
});

/**
 * Schema for search query
 */
export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query cannot be empty").max(500, "Query too long"),
  limit: z.number().min(1).max(10).optional(),
});

// TypeScript types
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
