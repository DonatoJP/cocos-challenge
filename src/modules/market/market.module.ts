import { Module } from '@nestjs/common';
import { InstrumentsService } from './application/instruments.service';
import { InstrumentsRepository } from './infrastructure/instruments.repository';
import { LoadDatabaseFeatures } from 'src/lib/database';
import { InstrumentSchema } from './infrastructure/schemas/instruments.schema';

@Module({
  imports: [LoadDatabaseFeatures([InstrumentSchema])],
  providers: [InstrumentsService, InstrumentsRepository],
  exports: [InstrumentsService],
})
export class MarketModule {}
