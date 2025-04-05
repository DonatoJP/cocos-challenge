import { DynamicModule, Module } from '@nestjs/common';
import { OrdersController } from './interface/orders.controller';
import { RouterModule } from '@nestjs/core';
import { OrdersService } from './application/orders.service';
import { LimitOrdersStrategy } from './application/strategies/limitOrders.strategy';
import { MarketOrdersStrategy } from './application/strategies/marketOrders.strategy';
import { OrderSchema } from './infrastructure/schemas/orders.schema';
import { LoadDatabaseFeature } from 'src/lib/database';
import { OrdersRepository } from './infrastructure/orders.repository';

@Module({
  imports: [LoadDatabaseFeature(OrderSchema)],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    MarketOrdersStrategy,
    LimitOrdersStrategy,
  ],
})
export class OrdersModule {
  static withRouting(): DynamicModule {
    return {
      module: OrdersModule,
      imports: [
        RouterModule.register([
          {
            path: 'v1/orders',
            module: OrdersModule,
          },
        ]),
      ],
    };
  }
}
