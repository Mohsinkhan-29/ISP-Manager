import express from 'express';
import { registerTenant, login, getMe, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { writeLimiter, getLimiter, authLimiter } from '../middlewares/rateLimit.js';
import { registerTenantSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register-tenant', 
  writeLimiter,
  validate(registerTenantSchema), 
  registerTenant
);

router.post('/login', 
  authLimiter,
  validate(loginSchema),
  login
);

router.get(
  '/me',
  authMiddleware,
  getLimiter,
  getMe
);

router.get(
  '/logout',
  authMiddleware,
  authLimiter,
  logout
)

export default router;