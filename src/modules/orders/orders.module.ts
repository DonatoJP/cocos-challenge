import { DynamicModule, Module } from '@nestjs/common';
import { OrdersController } from './interface/orders.controller';
import { RouterModule } from '@nestjs/core';
import { OrdersService } from './application/orders.service';
import { LimitOrdersStrategy } from './application/strategies/limitOrders.strategy';
import { MarketOrdersStrategy } from './application/strategies/marketOrders.strategy';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, MarketOrdersStrategy, LimitOrdersStrategy],
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
