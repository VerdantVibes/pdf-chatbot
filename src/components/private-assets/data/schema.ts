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
  analysis: z.object({
    ai_summary: z.string(),
  }),
});

export type Pdf = z.infer<typeof pdfSchema>;
