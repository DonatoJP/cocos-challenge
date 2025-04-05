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
}
