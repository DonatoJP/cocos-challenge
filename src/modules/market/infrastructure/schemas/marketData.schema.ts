import { EntitySchema } from 'typeorm';
import { MarketData } from '../../domain/marketData.model';

export const MarketDataSchema = new EntitySchema<MarketData>({
  name: 'MarketData',
  target: MarketData,
  tableName: 'marketdata',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      generated: true,
    },
    instrumentid: {
      type: 'integer',
    },
    high: {
      type: 'float',
    },
    low: {
      type: 'float',
    },
    open: {
      type: 'float',
    },
    close: {
      type: 'float',
    },
    previousClose: {
      type: 'float',
    },
    date: {
      type: 'date',
      createDate: true,
    },
  },
  relations: {
    instrumentid: {
      type: 'many-to-one',
      target: 'Instrument',
    },
  },
});
