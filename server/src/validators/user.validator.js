import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().min(2).max(150),
  phone: z.string().min(5).max(30),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(150).optional(),
  phone: z.string().min(5).max(30).optional(),
  email: z.string().email().optional().or(z.literal('')).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});