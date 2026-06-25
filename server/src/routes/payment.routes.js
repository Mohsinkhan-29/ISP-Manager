import express from 'express';

import {
  createPayment,
  getPayments,
  getPaymentById
} from '../controllers/payment.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';
import { validate } from '../middlewares/validate.js'
import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js'
import { createPaymentSchema } from '../validators/payment.validator.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  writeLimiter,
  validate(createPaymentSchema),
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  createPayment
);

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getPayments
);

router.get(
  '/:id',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getPaymentById
);

export default router;