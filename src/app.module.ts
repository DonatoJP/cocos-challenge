import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';
import { LoadConfigModule } from './lib/config';
import { LoadDatabaseModule } from './lib/database';
import { MarketModule } from './modules/market/market.module';

@Module({
  imports: [
    LoadConfigModule(),
    LoadDatabaseModule(),
    OrdersModule.withRouting(),
    MarketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
