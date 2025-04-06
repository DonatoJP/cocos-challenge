import { EntitySchema } from 'typeorm';
import { Instrument } from '../../domain/instruments.model';

export const InstrumentSchema = new EntitySchema<Instrument>({
  name: 'Instrument',
  target: Instrument,
  tableName: 'instruments',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      generated: true,
    },
    ticker: {
      type: 'varchar',
      length: 10,
    },
    name: {
      type: 'varchar',
      length: 255,
    },
    type: {
      type: 'varchar',
      length: 10,
    },
  },
});
