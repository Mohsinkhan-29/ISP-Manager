import express from 'express';

import {
  createSubscription,
  updateSubscriptionStatus,
  getSubscriptions
} from '../controllers/subscription.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

import { validate } from '../middlewares/validate.js';
import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js';
import { createSubscriptionSchema, updateSubscriptionStatusSchema } from '../validators/subscription.validator.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  writeLimiter,
  validate(createSubscriptionSchema),
  requireRole('OWNER', 'ADMIN'),
  createSubscription
);

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getSubscriptions
);

router.patch(
  '/:id/status',
  authMiddleware,
  writeLimiter,
  validate(updateSubscriptionStatusSchema),
  requireRole('OWNER', 'ADMIN'),
  updateSubscriptionStatus
);

export default router;