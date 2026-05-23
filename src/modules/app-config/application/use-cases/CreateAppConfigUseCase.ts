import { AppError } from '../../../../middlewares/errorHandler';
import { AppConfigResult, IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';
import { CreateAppConfigDto } from '../dtos/AppConfigDto';

export class CreateAppConfigUseCase {
  constructor(private readonly repo: IAppConfigRepository) {}

  async execute(dto: CreateAppConfigDto): Promise<AppConfigResult> {
    const existing = await this.repo.findByKey(dto.key);
    if (existing) throw new AppError(`Config key "${dto.key}" already exists`, 409);
    return this.repo.create(dto);
  }
}
