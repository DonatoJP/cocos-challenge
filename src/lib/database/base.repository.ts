import { ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async getAll(): Promise<T[]> {
    return this.repository.find();
  }
}
