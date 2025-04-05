import { Injectable } from '@nestjs/common';
import { InstrumentsRepository } from '../infrastructure/instruments.repository';
import { Instrument } from '../domain/instruments.model';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async getInstrumentByTicker(ticker: string): Promise<Instrument | null> {
    return this.instrumentsRepository.getBy('ticker', ticker);
  }
}
