import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';
import { LoadConfigModule } from './lib/config';
import { LoadDatabaseModule } from './lib/database';
import { MarketModule } from './modules/market/market.module';
import { UsersModule } from './modules/users/users.module';
import { LoadCacheModule } from './lib/cache';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    LoadConfigModule(),
    LoadDatabaseModule(),
    LoadCacheModule(),
    EventEmitterModule.forRoot(),
    OrdersModule,
    MarketModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
