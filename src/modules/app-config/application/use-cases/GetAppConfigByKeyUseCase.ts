import { AppError } from '../../../../middlewares/errorHandler';
import { AppConfigResult, IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';

export class GetAppConfigByKeyUseCase {
  constructor(private readonly repo: IAppConfigRepository) {}

  async execute(key: string): Promise<AppConfigResult> {
    const config = await this.repo.findByKey(key);
    if (!config) throw new AppError(`Config key "${key}" not found`, 404);
    return config;
  }
}
