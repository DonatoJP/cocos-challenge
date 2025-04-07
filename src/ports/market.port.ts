import { Instrument } from 'src/modules/market/domain/instruments.model';
import { MarketData } from 'src/modules/market/domain/marketData.model';

export interface MarketAccessPort {
  getInstrumentByTicker(ticker: string): Promise<Instrument | null>;
  getLatestMarketPrice(instrumentid: number): Promise<number | null>;
  getLatestMarketData(instrumentid: number): Promise<MarketData | null>;
}

export const MARKET_ACCESS_PORT = Symbol('MarketAccessPort');
