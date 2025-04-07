import {
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export interface IQueryOptions<T extends ObjectLiteral> {
  relations?: FindOptionsRelations<T>;
  order?: FindOptionsOrder<T>;
}
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async getById(
    id: T['id'],
    { relations }: IQueryOptions<T> = {},
  ): Promise<T | null> {
    return this.getOneBy('id', id, { relations });
  }

  async getAll({ relations }: IQueryOptions<T> = {}): Promise<T[]> {
    return this.repository.find({ relations });
  }

  async getOneBy<K extends keyof T>(
    key: K,
    value: T[K],
    { relations }: IQueryOptions<T> = {},
  ): Promise<T | null> {
    return this.repository.findOne({
      where: { [key]: value },
      relations,
    } as FindOneOptions<T>);
  }

  async getBy<K extends keyof T>(
    key: K,
    value: T[K],
    { relations, order }: IQueryOptions<T> = {},
  ): Promise<T[]> {
    return this.repository.find({
      where: { [key]: value },
      relations,
      order,
    } as FindOneOptions<T>);
  }

  async updateById<I extends T['id']>(
    id: I,
    update: T,
  ): Promise<T | undefined> {
    return this.repository.save({ id, ...update });
  }
}
