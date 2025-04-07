import { DynamicModule, Module } from '@nestjs/common';
import { InstrumentsService } from './application/instruments.service';
import { InstrumentsRepository } from './infrastructure/instruments.repository';
import { LoadDatabaseFeatures } from 'src/lib/database';
import { InstrumentSchema } from './infrastructure/schemas/instruments.schema';
import { MarketDataService } from './application/marketData.service';
import { MarketDataRepository } from './infrastructure/marketData.repository';
import { MarketDataSchema } from './infrastructure/schemas/marketData.schema';
import { MarketAdapter } from './interface/adapters/market.adapter';
import { MarketController } from './interface/market.controller';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [LoadDatabaseFeatures([InstrumentSchema, MarketDataSchema])],
  providers: [
    InstrumentsService,
    InstrumentsRepository,
    MarketDataService,
    MarketDataRepository,
    MarketAdapter,
  ],
  controllers: [MarketController],
  exports: [MarketAdapter],
})
export class MarketModule {
  static withRouting(): DynamicModule {
    return {
      module: MarketModule,
      imports: [
        RouterModule.register([
          {
            path: 'v1/market',
            module: MarketModule,
          },
        ]),
      ],
    };
  }
}
