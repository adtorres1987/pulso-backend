import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, userController.getAll);
router.get('/:id', authenticate, userController.getOne);
router.post('/', userController.create);
router.patch('/:id', authenticate, userController.update);
router.delete('/:id', authenticate, userController.remove);

export default router;
