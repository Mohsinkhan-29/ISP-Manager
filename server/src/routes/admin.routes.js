import express from 'express';

import {
  createAdmin, getAdmins, deleteAdmin, updateAdminRole
} from '../controllers/admin.controller.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

import {
  requireRole
} from '../middlewares/requireRole.js';

import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { createAdminSchema, updateAdminRoleSchema } from '../validators/admin.validator.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER'),
  validate(createAdminSchema),
  createAdmin
);

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN'),
  getAdmins
);

router.delete(
  '/:id',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER'),
  deleteAdmin
);

router.patch(
  '/:id/role',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER'),
  validate(updateAdminRoleSchema),
  updateAdminRole
);

export default router;