import { IJwtService } from '../../domain/services/IJwtService';
import { ITokenBlacklistService } from '../../domain/services/ITokenBlacklistService';
import { AppError } from '../../../../middlewares/errorHandler';

export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly blacklistService: ITokenBlacklistService,
  ) {}

  async execute(token: string): Promise<{ token: string }> {
    const payload = this.jwtService.verify(token);

    const isBlacklisted = await this.blacklistService.isBlacklisted(payload.jti);
    if (isBlacklisted) throw new AppError('Token has been revoked', 401);

    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) {
      await this.blacklistService.blacklist(payload.jti, remaining);
    }

    const newToken = this.jwtService.sign({ userId: payload.userId, email: payload.email });
    return { token: newToken };
  }
}
