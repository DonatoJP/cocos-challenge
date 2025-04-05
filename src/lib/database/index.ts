import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EntitySchema } from 'typeorm';

export const LoadDatabaseModule = () =>
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
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

export const LoadDatabaseFeature = (schema: EntitySchema) =>
  TypeOrmModule.forFeature([schema]);
