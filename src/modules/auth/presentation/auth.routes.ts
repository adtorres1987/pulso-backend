import { Router } from 'express';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { JwtService } from '../infrastructure/services/JwtService';
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { AuthController } from './AuthController';
import { validateRegister } from './validators/register.validator';
import { validateLogin } from './validators/login.validator';

const router = Router();

// Dependency injection (manual)
const userRepository = new PrismaUserRepository();
const jwtService = new JwtService();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, jwtService);
const authController = new AuthController(registerUserUseCase, loginUseCase);

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

export default router;
