import { DynamicModule, Module } from '@nestjs/common';
import { OrdersController } from './interface/orders.controller';
import { RouterModule } from '@nestjs/core';
import { OrdersService } from './application/orders.service';
import { LimitOrdersStrategy } from './application/strategies/limitOrders.strategy';
import { MarketOrdersStrategy } from './application/strategies/marketOrders.strategy';
import { OrderSchema } from './infrastructure/schemas/orders.schema';
import { LoadDatabaseFeatures } from 'src/lib/database';
import { OrdersRepository } from './infrastructure/orders.repository';
import { MarketModule } from '../market/market.module';
import { MarketAdapter } from '../market/interface/adapters/market.adapter';
import { MARKET_ACCESS_PORT } from 'src/ports/market.port';

@Module({
  imports: [LoadDatabaseFeatures([OrderSchema]), MarketModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    MarketOrdersStrategy,
    LimitOrdersStrategy,
    {
      provide: MARKET_ACCESS_PORT,
      useClass: MarketAdapter,
    },
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
