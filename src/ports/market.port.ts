import { Instrument } from 'src/modules/market/domain/instruments.model';

export interface MarketAccessPort {
  getInstrumentByTicker(ticker: string): Promise<Instrument | null>;
}

export const MARKET_ACCESS_PORT = Symbol('MarketAccessPort');
