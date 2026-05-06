import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { RegisterUserDto, RegisterUserResponseDto } from '../dtos/RegisterUserDto';
import { AppError } from '../../../../middlewares/errorHandler';
import { CreateTrialSubscriptionUseCase } from '../../../subscriptions/application/use-cases/CreateTrialSubscriptionUseCase';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly createTrialSubscription: CreateTrialSubscriptionUseCase,
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegisterUserResponseDto> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.register({
      email: dto.email,
      passwordHash,
      language: dto.language,
      timezone: dto.timezone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleName: dto.role ?? 'user',
    });

    // Auto-create trial subscription — non-blocking if no plan exists yet
    try {
      await this.createTrialSubscription.execute(user.id);
    } catch {
      // Silently skip if no plan is configured yet
    }

    return user;
  }
}
