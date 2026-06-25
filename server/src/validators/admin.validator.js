import { z } from 'zod';

export const createAdminSchema = z.object({

  name: z
    .string()
    .min(2)
    .max(100),

  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(6)
    .max(100),

  role: z.enum([
    'OWNER',
    'ADMIN',
    'STAFF'
  ])

});

export const updateAdminRoleSchema = z.object({

  role: z.enum([
    'OWNER',
    'ADMIN',
    'STAFF'
  ])

});