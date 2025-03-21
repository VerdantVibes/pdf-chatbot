import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const pdfSchema = z.object({
  id: z.string(),
  filename: z.string(),
  email_subject: z.string(),
  source: z.string(),
  author: z.array(z.string()),
  sector: z.array(z.string()),
  category_tags: z.array(z.string()),
  drive_web_link: z.string(),
  email_received_date: z.string(),
  file_size: z.number(),
});

export type Pdf = z.infer<typeof pdfSchema>;

export const paginationSchema = z.object({
  total: z.number(),
  current_page: z.number(),
  items_per_page: z.number(),
  total_pages: z.number(),
  has_more: z.boolean(),
});

export const pdfResponseSchema = z.object({
  items: z.array(pdfSchema),
  pagination: paginationSchema,
});

export type PdfResponse = z.infer<typeof pdfResponseSchema>;
