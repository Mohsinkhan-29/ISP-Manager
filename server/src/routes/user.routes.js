import express from 'express';

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  activateUser,
  deactivateUser
} from '../controllers/user.controller.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

import {
  requireRole
} from '../middlewares/requireRole.js';

import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import { writeLimiter, getLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER', 'ADMIN'),
  validate(createUserSchema),
  createUser
);

router.get(
  '/',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getUsers
);

router.get(
  '/:id',
  authMiddleware,
  getLimiter,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  getUserById
);

router.patch(
  '/:id',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER', 'ADMIN'),
  validate(updateUserSchema),
  updateUser
);

router.patch(
  '/:id/activate',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER', 'ADMIN'),
  activateUser
);

router.patch(
  '/:id/deactivate',
  authMiddleware,
  writeLimiter,
  requireRole('OWNER', 'ADMIN'),
  deactivateUser
);


export default router;