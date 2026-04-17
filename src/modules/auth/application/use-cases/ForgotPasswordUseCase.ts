import crypto from 'crypto';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { ForgotPasswordDto } from '../dtos/ForgotPasswordDto';
import { env } from '../../../../config/env';

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Always return success to avoid revealing whether the email exists
    if (!user) return;

    // Invalidate any previous tokens for this user
    await this.userRepository.deletePasswordResetTokensByUserId(user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + EXPIRY_MS);

    await this.userRepository.createPasswordResetToken(user.id, token, expiresAt);

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset(user.email, resetLink);
  }
}
