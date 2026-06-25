import { z } from 'zod';

export const createInvoiceSchema = z.object({

  user_id: z
    .string()
    .uuid(),

  subscription_id: z
    .string()
    .uuid(),

  billing_month: z
    .string(),

  due_date: z
    .string()
    .optional()

});