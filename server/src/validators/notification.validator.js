import { z } from 'zod';

export const updateNotificationStatusSchema = z.object({

  status: z.enum([
    'pending',
    'sent',
    'failed'
  ])

});