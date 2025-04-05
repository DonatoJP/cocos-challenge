import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';
import { LoadConfigModule } from './lib/config';
import { LoadDatabaseModule } from './lib/database';

@Module({
  imports: [
    LoadConfigModule(),
    LoadDatabaseModule(),
    OrdersModule.withRouting(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
