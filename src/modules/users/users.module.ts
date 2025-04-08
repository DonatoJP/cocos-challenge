import { Module } from '@nestjs/common';
import { UsersRepository } from './infraestructure/users.repository';
import { UserSchema } from './infraestructure/schemas/users.schema';
import { LoadDatabaseFeatures } from 'src/lib/database';
import { UsersService } from './application/users.service';
import { UsersController } from './interface/users.controller';
import { RouterModule } from '@nestjs/core';
import { ORDERS_ACCESS_PORT } from 'src/ports/orders.port';
import { OrdersAdapter } from '../orders/interface/adapters/orders.adapter';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    LoadDatabaseFeatures([UserSchema]),
    RouterModule.register([
      {
        path: 'v1/users',
        module: UsersModule,
      },
    ]),
    OrdersModule,
  ],
  providers: [
    UsersRepository,
    UsersService,
    {
      provide: ORDERS_ACCESS_PORT,
      useExisting: OrdersAdapter,
    },
  ],
  controllers: [UsersController],
})
export class UsersModule {}
