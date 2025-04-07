import { Injectable } from '@nestjs/common';
import { InstrumentsRepository } from '../infrastructure/instruments.repository';
import { IInstrument, Instrument } from '../domain/instruments.model';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async getInstrumentByTicker(ticker: string): Promise<Instrument | null> {
    return this.instrumentsRepository.getOneBy('ticker', ticker);
  }

  async getInstrumentsPaginated(
    search?: IInstrument,
    { page, limit }: { page: number; limit: number } = { page: 0, limit: 10 },
  ): Promise<Instrument[]> {
    const instruments = await this.instrumentsRepository.filter(search, {
      take: limit,
      skip: page * limit,
    });

    return instruments;
  }

  async countInstruments(search?: IInstrument) {
    return this.instrumentsRepository.count(search);
  }
}
