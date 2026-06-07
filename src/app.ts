import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

// Routes
import stripeWebhookRoutes from './modules/webhooks/presentation/stripe-webhook.routes';
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
import adminUserRoutes from './modules/admin-users/presentation/admin-user.routes';
import appConfigRoutes from './modules/app-config/presentation/app-config.routes';
import subscriptionPlanRoutes from './modules/subscription-plans/presentation/subscription-plan.routes';
import publicPlanRoutes from './modules/subscription-plans/presentation/public-plan.routes';
import subscriptionRoutes from './modules/subscriptions/presentation/subscription.routes';
import groupRoutes from './modules/groups/presentation/group.routes';
import userRoutes from './modules/users/presentation/user.routes';
import dashboardRoutes from './modules/dashboard/presentation/dashboard.routes';
import budgetRoutes from './modules/budgets/presentation/budget.routes';
import recurringTransactionRoutes from './modules/recurring-transactions/presentation/recurringTransaction.routes';
import pushTokenRoutes from './modules/push-tokens/presentation/push-token.routes';

const app = express();

// Stripe webhook — must be registered before express.json() to receive raw body for signature verification
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

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
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/app-config', appConfigRoutes);
app.use('/api/v1/admin/subscription-plans', subscriptionPlanRoutes);
app.use('/api/v1/plans', publicPlanRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/recurring-transactions', recurringTransactionRoutes);
app.use('/api/v1/push-tokens', pushTokenRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
