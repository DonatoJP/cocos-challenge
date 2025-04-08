import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EntitySchema } from 'typeorm';

export const LoadDatabaseModule = () =>
  TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => {
      return {
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadEntities: true,
        synchronize: false,
      };
    },
    inject: [ConfigService],
  });

export const LoadDatabaseFeatures = (schemas: EntitySchema[]) =>
  TypeOrmModule.forFeature(schemas);
