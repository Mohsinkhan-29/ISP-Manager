import express from 'express';
import cors from 'cors';
import { prisma } from './config/prisma.js';
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import planRoutes from './routes/plan.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { startInvoiceCron } from './cron/invoice.cron.js';
import { startNotificationCron } from './cron/notification.cron.js';
import cookieParser from 'cookie-parser';

const app = express();

// Middlewares
app.use(cors({
  origin: "https://isp-manager-gold.vercel.app", // URL EXAMPLE: http://localhost:5173
  credentials: true
}));


app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('ISP SaaS API running');
});

app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      database: 'connected',
      server: 'running'
    });

  } catch (err) {
    res.status(500).json({
      database: 'failed',
      error: err.message
    });
  }
});

startInvoiceCron();
startNotificationCron();

export default app;