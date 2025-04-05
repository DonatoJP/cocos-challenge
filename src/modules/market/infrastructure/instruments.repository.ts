import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/lib/database/base.repository';
import { Instrument } from '../domain/instruments.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InstrumentsRepository extends BaseRepository<Instrument> {
  constructor(
    @InjectRepository(Instrument)
    repository: Repository<Instrument>,
  ) {
    super(repository);
  }
}
