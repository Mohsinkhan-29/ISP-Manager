import express from 'express';

import {
  getLedgerEntries,
  getLedgerEntryById,
  getCustomerLedger
} from '../controllers/ledger.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';
import { getLimiter } from '../middlewares/rateLimit.js'

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getLedgerEntries
);

router.get(
  '/customer/:userId',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getCustomerLedger
);

router.get(
  '/:id',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getLedgerEntryById
);

export default router;