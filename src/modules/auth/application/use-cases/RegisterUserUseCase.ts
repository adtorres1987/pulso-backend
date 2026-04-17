import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { RegisterUserDto, RegisterUserResponseDto } from '../dtos/RegisterUserDto';
import { AppError } from '../../../../middlewares/errorHandler';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

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
      roleName: dto.role,
    });

    return user;
  }
}
