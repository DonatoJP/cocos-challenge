import { Injectable } from '@nestjs/common';
import { MarketDataRepository } from '../infrastructure/marketData.repository';
import { MarketData } from '../domain/marketData.model';

@Injectable()
export class MarketDataService {
  constructor(private readonly marketDataRepository: MarketDataRepository) {}

  async getLatestMarketPrice(instrumentid: number): Promise<number | null> {
    const marketData = await this.getLatestMarketData(instrumentid);
    return marketData?.close ?? null;
  }

  async getLatestMarketData(instrumentid: number): Promise<MarketData | null> {
    return this.marketDataRepository.getLatestMarketData(instrumentid);
  }
}
