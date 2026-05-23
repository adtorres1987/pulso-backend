import { AppError } from '../../../../middlewares/errorHandler';
import { IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';

const PROTECTED_KEYS = ['trial_days', 'group_discount_percent'];

export class DeleteAppConfigUseCase {
  constructor(private readonly repo: IAppConfigRepository) {}

  async execute(key: string): Promise<void> {
    if (PROTECTED_KEYS.includes(key)) {
      throw new AppError(`Config key "${key}" is protected and cannot be deleted`, 403);
    }
    const existing = await this.repo.findByKey(key);
    if (!existing) throw new AppError(`Config key "${key}" not found`, 404);
    await this.repo.delete(key);
  }
}
