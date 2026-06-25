import { z } from 'zod';

export const createPaymentSchema = z.object({

  invoice_id: z
    .string()
    .uuid(),

  amount_paid: z
    .number()
    .positive(),

  payment_method: z
    .string()
    .min(2)
    .max(50)

});