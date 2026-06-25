import { z } from 'zod';

export const registerTenantSchema = z.object({
  tenantName: z.string().min(2).max(100),
  adminName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});