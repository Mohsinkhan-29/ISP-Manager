import express from 'express';

import {
  createPlan,
  getPlans,
  updatePlan,
  activatePlan,
  deactivatePlan
} from '../controllers/plan.controller.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

import {
  requireRole
} from '../middlewares/requireRole.js';

import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js'
import { validate } from '../middlewares/validate.js'
import { createPlanSchema, updatePlanSchema } from '../validators/plan.validator.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  writeLimiter,
  validate(createPlanSchema),
  requireRole('OWNER', 'ADMIN'),
  createPlan
);

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getPlans
);

router.patch(
  '/:id',
  authMiddleware,
  writeLimiter,
  validate(updatePlanSchema),
  requireRole('OWNER', 'ADMIN'),
  updatePlan
);

router.patch(
  '/:id/deactivate',
  authMiddleware,
  requireRole('OWNER', 'ADMIN'),
  deactivatePlan
);

router.patch(
  '/:id/activate',
  authMiddleware,
  requireRole('OWNER', 'ADMIN'),
  activatePlan
);

export default router;