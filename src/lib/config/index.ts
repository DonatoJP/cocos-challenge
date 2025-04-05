import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';

export const LoadConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env'],
    load: [databaseConfig],
  });
