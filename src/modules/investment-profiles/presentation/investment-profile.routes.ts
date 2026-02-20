import { Router } from 'express';
import { PrismaInvestmentProfileRepository } from '../infrastructure/repositories/PrismaInvestmentProfileRepository';
import { GetAllInvestmentProfilesUseCase } from '../application/use-cases/GetAllInvestmentProfilesUseCase';
import { GetInvestmentProfileByIdUseCase } from '../application/use-cases/GetInvestmentProfileByIdUseCase';
import { CreateInvestmentProfileUseCase } from '../application/use-cases/CreateInvestmentProfileUseCase';
import { UpdateInvestmentProfileUseCase } from '../application/use-cases/UpdateInvestmentProfileUseCase';
import { DeleteInvestmentProfileUseCase } from '../application/use-cases/DeleteInvestmentProfileUseCase';
import { InvestmentProfileController } from './InvestmentProfileController';
import {
  validateCreateInvestmentProfile,
  validateUpdateInvestmentProfile,
} from './validators/investment-profile.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const investmentProfileRepository = new PrismaInvestmentProfileRepository();
const investmentProfileController = new InvestmentProfileController(
  new GetAllInvestmentProfilesUseCase(investmentProfileRepository),
  new GetInvestmentProfileByIdUseCase(investmentProfileRepository),
  new CreateInvestmentProfileUseCase(investmentProfileRepository),
  new UpdateInvestmentProfileUseCase(investmentProfileRepository),
  new DeleteInvestmentProfileUseCase(investmentProfileRepository),
);

router.get('/', authenticate, investmentProfileController.getAll);
router.get('/:id', authenticate, investmentProfileController.getOne);
router.post('/', authenticate, validateCreateInvestmentProfile, investmentProfileController.create);
router.patch('/:id', authenticate, validateUpdateInvestmentProfile, investmentProfileController.update);
router.delete('/:id', authenticate, investmentProfileController.remove);

export default router;
