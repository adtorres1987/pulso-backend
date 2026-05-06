import { AppConfigResult, IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';

export class GetAllAppConfigUseCase {
  constructor(private readonly repo: IAppConfigRepository) {}

  execute(): Promise<AppConfigResult[]> {
    return this.repo.findAll();
  }
}
