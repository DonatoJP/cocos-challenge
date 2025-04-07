import { Controller, Get, Query } from '@nestjs/common';
import { InstrumentsService } from '../application/instruments.service';
import { ZodValidationPipe } from 'src/pipes/zodValidator.pipe';
import {
  GetInstrumentsPaginatedDTO,
  getInstrumentsPaginatedSchema,
} from './dto/getInstrumentsPaginated.dto';

@Controller()
export class MarketController {
  constructor(private readonly instrumentsService: InstrumentsService) {}
  @Get('/instruments')
  async getInstrumentsPaginated(
    @Query(new ZodValidationPipe(getInstrumentsPaginatedSchema))
    { name, ticker, limit, page }: GetInstrumentsPaginatedDTO,
  ) {
    const [data, total] = await Promise.all([
      this.instrumentsService.getInstrumentsPaginated(
        { name, ticker },
        {
          page: Number(page),
          limit: Number(limit),
        },
      ),
      this.instrumentsService.countInstruments(),
    ]);
    return { data, total };
  }
}
