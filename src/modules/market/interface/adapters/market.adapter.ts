import { Injectable } from '@nestjs/common';
import { InstrumentsService } from '../../application/instruments.service';
import { Instrument } from '../../domain/instruments.model';
import { MarketAccessPort } from 'src/ports/market.port';

@Injectable()
export class MarketAdapter implements MarketAccessPort {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  async getInstrumentByTicker(ticker: string): Promise<Instrument | null> {
    return this.instrumentsService.getInstrumentByTicker(ticker);
  }
}
