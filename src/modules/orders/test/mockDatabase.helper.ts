import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';
jest.mock('src/lib/database', () => ({
  LoadDatabaseModule: () => ({
    module: class {},
    providers: [],
    imports: [],
  }),
  LoadDatabaseFeatures: (schemas: EntitySchema[]) => {
    return TypeOrmModule.forFeature(schemas);
  },
}));
