import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/lib/database/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketData } from '../domain/marketData.model';

@Injectable()
export class MarketDataRepository extends BaseRepository<MarketData> {
  constructor(
    @InjectRepository(MarketData)
    repository: Repository<MarketData>,
  ) {
    super(repository);
  }

  async getLatestMarketData(instrumentid: number): Promise<MarketData | null> {
    const marketData = await this.repository.findOne({
      where: { instrumentid },
      order: { date: 'DESC' },
    });

    return marketData;
  }
}
