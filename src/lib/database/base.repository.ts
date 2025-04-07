import {
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
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

  async filter(
    where?: FindOptionsWhere<T>,
    { skip, take }: { skip: number; take: number } = { skip: 0, take: 10 },
  ) {
    let w: { str: string; count: number; regex: Record<string, string> };
    if (where) {
      w = Object.entries(where).reduce(
        (acc, [k, v]) => {
          return !v
            ? acc
            : {
                str: `${acc.str} AND ${k} ~* :regex${acc.count}`,
                regex: {
                  ...acc.regex,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  [`regex${acc.count}`]: v,
                },
                count: acc.count + 1,
              };
        },
        { str: '', count: 0, regex: {} },
      );
    } else {
      w = { str: '', count: 0, regex: {} };
    }

    return this.repository
      .createQueryBuilder(undefined, this.repository.queryRunner)
      .where(w.str.length > 0 ? w.str.substring(5) : w.str, w.regex)
      .skip(skip)
      .take(take)
      .getMany();
  }

  async count(where?: FindOptionsWhere<T>) {
    return this.repository.count({ where });
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
