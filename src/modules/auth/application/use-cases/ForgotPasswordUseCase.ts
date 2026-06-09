import crypto from 'crypto';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { ForgotPasswordDto } from '../dtos/ForgotPasswordDto';
import { env } from '../../../../config/env';
import { APP_CONFIG_KEYS, IAppConfigRepository } from '../../../app-config/domain/repositories/IAppConfigRepository';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly configRepo: IAppConfigRepository,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Always return success to avoid revealing whether the email exists
    if (!user) return;

    // Invalidate any previous tokens for this user
    await this.userRepository.deletePasswordResetTokensByUserId(user.id);

    const expiryHours = await this.configRepo.getValueAsNumber(APP_CONFIG_KEYS.PASSWORD_RESET_EXPIRY_HOURS, 1);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    await this.userRepository.createPasswordResetToken(user.id, token, expiresAt);

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset(user.email, resetLink, expiryHours);
  }
}
