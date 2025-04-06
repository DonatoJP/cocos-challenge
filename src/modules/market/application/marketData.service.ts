import { Injectable } from '@nestjs/common';
import { MarketDataRepository } from '../infrastructure/marketData.repository';

@Injectable()
export class MarketDataService {
  constructor(private readonly marketDataRepository: MarketDataRepository) {}

  async getLatestMarketPrice(instrumentid: number): Promise<number | null> {
    const marketData =
      await this.marketDataRepository.getLatestMarketData(instrumentid);
    return marketData?.close ?? null;
  }
}
