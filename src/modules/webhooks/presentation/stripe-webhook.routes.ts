import { Router } from 'express';
import { StripeWebhookController } from './StripeWebhookController';

const router = Router();
const controller = new StripeWebhookController();

// express.raw() is applied in app.ts before express.json(), so req.body is a Buffer here
router.post('/', controller.handle);

export default router;
