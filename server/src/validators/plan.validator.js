import { z } from 'zod';

export const createPlanSchema = z.object({

  name: z
    .string()
    .min(2)
    .max(100),

  speed_mbps: z
    .number()
    .positive(),

  price: z
    .number()
    .positive()

});

export const updatePlanSchema = z.object({

  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  speed_mbps: z
    .number()
    .positive()
    .optional(),

  price: z
    .number()
    .positive()
    .optional(),

  is_active: z
    .boolean()
    .optional()

});