import { Injectable } from '@nestjs/common';
import { InstrumentsService } from '../../application/instruments.service';
import { Instrument } from '../../domain/instruments.model';
import { MarketAccessPort } from 'src/ports/market.port';
import { MarketDataService } from '../../application/marketData.service';

@Injectable()
export class MarketAdapter implements MarketAccessPort {
  constructor(
    private readonly instrumentsService: InstrumentsService,
    private readonly marketDataService: MarketDataService,
  ) {}

  async getInstrumentByTicker(ticker: string): Promise<Instrument | null> {
    return this.instrumentsService.getInstrumentByTicker(ticker);
  }

  async getLatestMarketPrice(instrumentid: number): Promise<number | null> {
    return this.marketDataService.getLatestMarketPrice(instrumentid);
  }
}
