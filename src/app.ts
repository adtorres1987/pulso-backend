import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

// Routes
import authRoutes from './modules/auth/presentation/auth.routes';
import roleRoutes from './modules/roles/presentation/role.routes';
import permissionRoutes from './modules/permissions/presentation/permission.routes';
import meRoutes from './modules/me/presentation/me.routes';
import categoryRoutes from './modules/categories/presentation/category.routes';
import transactionRoutes from './modules/transactions/presentation/transaction.routes';
import snapshotRoutes from './modules/snapshots/presentation/snapshot.routes';
import savingGoalRoutes from './modules/saving-goals/presentation/saving-goal.routes';
import habitRoutes from './modules/habits/presentation/habit.routes';
import investmentProfileRoutes from './modules/investment-profiles/presentation/investment-profile.routes';

const app = express();

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/me', meRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/snapshots', snapshotRoutes);
app.use('/api/v1/saving-goals', savingGoalRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/investment-profiles', investmentProfileRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
