import { Router } from 'express';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { JwtService } from '../infrastructure/services/JwtService';
import { RedisTokenBlacklistService } from '../infrastructure/services/RedisTokenBlacklistService';
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { RefreshTokenUseCase } from '../application/use-cases/RefreshTokenUseCase';
import { LogoutUseCase } from '../application/use-cases/LogoutUseCase';
import { AuthController } from './AuthController';
import { validateRegister } from './validators/register.validator';
import { validateLogin } from './validators/login.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

// Dependency injection (manual)
const userRepository = new PrismaUserRepository();
const jwtService = new JwtService();
const blacklistService = new RedisTokenBlacklistService();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, jwtService);
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, blacklistService);
const logoutUseCase = new LogoutUseCase(jwtService, blacklistService);
const authController = new AuthController(registerUserUseCase, loginUseCase, refreshTokenUseCase, logoutUseCase);

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authenticate, authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
