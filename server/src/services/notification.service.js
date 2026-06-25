import { prisma } from '../config/prisma.js';

export const createNotification = async ({
  tenant_id,
  user_id,
  type,
  message
}) => {

  return await prisma.notifications.create({
    data: {
      tenant_id,
      user_id,
      type,
      message,
      status: 'pending'
    }
  });

};

export const markNotificationSent = async (id) => {

  return await prisma.notifications.update({
    where: { id },
    data: {
      status: 'sent',
      sent_at: new Date()
    }
  });

};

export const markNotificationFailed = async (id) => {

  return await prisma.notifications.update({
    where: { id },
    data: {
      status: 'failed'
    }
  });

};