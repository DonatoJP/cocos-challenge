import { Module } from '@nestjs/common';
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
import { OrdersAdapter } from './interface/adapters/orders.adapter';
import { ORDERS_MESSAGE_BROKER } from 'src/ports/orders.port';
import { OrderEventsPort } from './application/ports/orderEvents.port';
import { OrderEventsConsumer } from './interface/consumers/orderEvents.consumer';
@Module({
  imports: [
    LoadDatabaseFeatures([OrderSchema]),
    RouterModule.register([
      {
        path: 'v1/orders',
        module: OrdersModule,
      },
    ]),
    MarketModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    MarketOrdersStrategy,
    LimitOrdersStrategy,
    {
      provide: MARKET_ACCESS_PORT,
      useExisting: MarketAdapter,
    },
    {
      provide: ORDERS_MESSAGE_BROKER,
      useClass: OrderEventsPort,
    },
    OrdersAdapter,
    OrderEventsConsumer,
  ],
  exports: [OrdersAdapter],
})
export class OrdersModule {}
