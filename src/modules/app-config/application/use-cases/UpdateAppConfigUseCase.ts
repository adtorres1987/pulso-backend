import { AppError } from '../../../../middlewares/errorHandler';
import { AppConfigResult, IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';
import { UpdateAppConfigDto } from '../dtos/AppConfigDto';

const NUMERIC_KEYS = ['trial_days', 'group_discount_percent'];

export class UpdateAppConfigUseCase {
  constructor(private readonly repo: IAppConfigRepository) {}

  async execute(key: string, dto: UpdateAppConfigDto): Promise<AppConfigResult> {
    if (NUMERIC_KEYS.includes(key)) {
      const num = Number(dto.value);
      if (!Number.isFinite(num) || num < 0) {
        throw new AppError(`Value for "${key}" must be a non-negative number`, 422);
      }
    }
    return this.repo.upsert(key, dto.value);
  }
}
