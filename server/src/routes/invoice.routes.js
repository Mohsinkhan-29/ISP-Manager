import express from 'express';

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  cancelInvoice
} from '../controllers/invoice.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';
import { validate } from '../middlewares/validate.js'
import { createInvoiceSchema } from '../validators/invoice.validator.js';
import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js'

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  writeLimiter,
  validate(createInvoiceSchema),
  requireRole('OWNER', 'ADMIN'),
  createInvoice
);

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getInvoices
);

router.get(
  '/:id',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getInvoiceById
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER', 'ADMIN'),
  cancelInvoice
);

export default router;