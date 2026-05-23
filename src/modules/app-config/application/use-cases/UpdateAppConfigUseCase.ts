import { AppError } from '../../../../middlewares/errorHandler';
import { AppConfigResult, IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';
import { UpdateAppConfigDto } from '../dtos/AppConfigDto';

const NUMERIC_KEYS = ['trial_days', 'group_discount_percent'];

export class UpdateAppConfigUseCase {
  constructor(private readonly repo: IAppConfigRepository) {}

  async execute(key: string, dto: UpdateAppConfigDto): Promise<AppConfigResult> {
    const existing = await this.repo.findByKey(key);
    if (!existing) throw new AppError(`Config key "${key}" not found`, 404);

    if (dto.value !== undefined && NUMERIC_KEYS.includes(key)) {
      const num = Number(dto.value);
      if (!Number.isFinite(num) || num < 0) {
        throw new AppError(`Value for "${key}" must be a non-negative number`, 422);
      }
    }

    return this.repo.update(key, dto);
  }
}
