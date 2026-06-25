import { z } from 'zod';

export const createSubscriptionSchema = z.object({

  user_id: z
    .string()
    .uuid(),

  plan_id: z
    .string()
    .uuid(),

  start_date: z
    .string(),

  billing_cycle: z
    .enum([
      'monthly',
      'weekly',
      'yearly'
    ])
    .optional(),

  custom_speed_mbps: z
    .number()
    .positive()
    .optional(),

  custom_price: z
    .number()
    .positive()
    .optional(),

  discount_amount: z
    .number()
    .min(0)
    .optional()

});

export const updateSubscriptionStatusSchema = z.object({

  status: z.enum([
    'active',
    'suspended',
    'terminated',
    'expired'
  ])

});