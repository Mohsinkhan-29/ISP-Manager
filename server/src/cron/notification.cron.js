import cron from 'node-cron';

import { prisma } from '../config/prisma.js';

export const startNotificationCron = () => {

  cron.schedule('0 0 10 * *', async () => {

    console.log('Running notification cron...');

    try {

      const users = await prisma.users.findMany({
        where: {
          is_active: true
        },
        take: 1
      });

      if (users.length === 0) {
        return;
      }

      const user = users[0];

      await prisma.notifications.create({
        data: {
          tenant_id: user.tenant_id,
          user_id: user.id,

          type: 'system',

          message: `Test notification generated at ${new Date().toISOString()}`,

          status: 'pending'
        }
      });

      console.log('Test notification created');

    } catch (err) {

      console.error('Notification cron failed:', err);

    }

  });

};