import { IJwtService } from '../../domain/services/IJwtService';
import { ITokenBlacklistService } from '../../domain/services/ITokenBlacklistService';

export class LogoutUseCase {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly blacklistService: ITokenBlacklistService,
  ) {}

  async execute(token: string): Promise<void> {
    const payload = this.jwtService.verify(token);
    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) {
      await this.blacklistService.blacklist(payload.jti, remaining);
    }
  }
}
