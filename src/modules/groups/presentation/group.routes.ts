import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { requireSubscription } from '../../../middlewares/requireSubscription';
import { PrismaGroupRepository } from '../infrastructure/repositories/PrismaGroupRepository';
import { PrismaSubscriptionRepository } from '../../subscriptions/infrastructure/repositories/PrismaSubscriptionRepository';
import { PrismaAppConfigRepository } from '../../app-config/infrastructure/repositories/PrismaAppConfigRepository';
import { GetAllGroupsUseCase } from '../application/use-cases/GetAllGroupsUseCase';
import { GetGroupByIdUseCase } from '../application/use-cases/GetGroupByIdUseCase';
import { CreateGroupUseCase } from '../application/use-cases/CreateGroupUseCase';
import { UpdateGroupUseCase } from '../application/use-cases/UpdateGroupUseCase';
import { DeleteGroupUseCase } from '../application/use-cases/DeleteGroupUseCase';
import { AddGroupMemberUseCase } from '../application/use-cases/AddGroupMemberUseCase';
import { RemoveGroupMemberUseCase } from '../application/use-cases/RemoveGroupMemberUseCase';
import { GetGroupExpensesUseCase } from '../application/use-cases/GetGroupExpensesUseCase';
import { GetGroupExpenseSummaryUseCase } from '../application/use-cases/GetGroupExpenseSummaryUseCase';
import { CreateGroupExpenseUseCase } from '../application/use-cases/CreateGroupExpenseUseCase';
import { UpdateGroupExpenseUseCase } from '../application/use-cases/UpdateGroupExpenseUseCase';
import { DeleteGroupExpenseUseCase } from '../application/use-cases/DeleteGroupExpenseUseCase';
import { IncludeShareInPersonalUseCase } from '../application/use-cases/IncludeShareInPersonalUseCase';
import { UpdateMemberPercentageUseCase } from '../application/use-cases/UpdateMemberPercentageUseCase';
import { AddGroupExpenseImageUseCase } from '../application/use-cases/AddGroupExpenseImageUseCase';
import { RemoveGroupExpenseImageUseCase } from '../application/use-cases/RemoveGroupExpenseImageUseCase';
import { GroupController } from './GroupController';
import {
  validateAddMember,
  validateCreateGroup,
  validateCreateGroupExpense,
  validateUpdateGroup,
  validateUpdateGroupExpense,
  validateUpdateMemberPercentage,
} from './validators/group.validator';
import { uploadImage } from '../../../middlewares/upload';

const router = Router();

const groupRepo = new PrismaGroupRepository();
const subscriptionRepo = new PrismaSubscriptionRepository();
const configRepo = new PrismaAppConfigRepository();

const controller = new GroupController(
  new GetAllGroupsUseCase(groupRepo),
  new GetGroupByIdUseCase(groupRepo),
  new CreateGroupUseCase(groupRepo),
  new UpdateGroupUseCase(groupRepo),
  new DeleteGroupUseCase(groupRepo),
  new AddGroupMemberUseCase(groupRepo, subscriptionRepo, configRepo),
  new RemoveGroupMemberUseCase(groupRepo, subscriptionRepo, configRepo),
  new GetGroupExpensesUseCase(groupRepo),
  new GetGroupExpenseSummaryUseCase(groupRepo),
  new CreateGroupExpenseUseCase(groupRepo),
  new UpdateGroupExpenseUseCase(groupRepo),
  new DeleteGroupExpenseUseCase(groupRepo),
  new IncludeShareInPersonalUseCase(groupRepo),
  new UpdateMemberPercentageUseCase(groupRepo),
  new AddGroupExpenseImageUseCase(groupRepo),
  new RemoveGroupExpenseImageUseCase(groupRepo),
);

const auth = [authenticate, requireSubscription];

router.get('/', ...auth, controller.index);
router.get('/:id', ...auth, controller.show);
router.post('/', ...auth, validateCreateGroup, controller.store);
router.patch('/:id', ...auth, validateUpdateGroup, controller.patch);
router.delete('/:id', ...auth, controller.destroy);

router.post('/:id/members', ...auth, validateAddMember, controller.addMemberHandler);
router.delete('/:id/members/:userId', ...auth, controller.removeMemberHandler);
router.patch('/:id/members/:userId/percentage', ...auth, validateUpdateMemberPercentage, controller.updateMemberPercentageHandler);

router.get('/:id/expenses', ...auth, controller.indexExpenses);
router.get('/:id/expenses/summary', ...auth, controller.showExpenseSummary);
router.post('/:id/expenses', ...auth, validateCreateGroupExpense, controller.storeExpense);
router.patch('/:id/expenses/:expenseId', ...auth, validateUpdateGroupExpense, controller.patchExpense);
router.delete('/:id/expenses/:expenseId', ...auth, controller.destroyExpense);
router.patch('/:id/expenses/:expenseId/shares/:shareId/include', ...auth, controller.includeShareInPersonal);
router.post('/:id/expenses/:expenseId/images', ...auth, uploadImage, controller.uploadExpenseImage);
router.delete('/:id/expenses/:expenseId/images/:imageId', ...auth, controller.deleteExpenseImage);

export default router;
