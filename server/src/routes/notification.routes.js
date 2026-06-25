import express from 'express';

import {
  getNotifications,
  getNotificationById,
  updateNotificationStatus
} from '../controllers/notification.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';
import { validate } from '../middlewares/validate.js'
import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js'
import { updateNotificationStatusSchema } from '../validators/notification.validator.js';

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getNotifications
);

router.get(
  '/:id',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getNotificationById
);

router.patch(
  '/:id/status',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER', 'ADMIN'),
  validate(updateNotificationStatusSchema),
  updateNotificationStatus
);

export default router;