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
    previousclose: {
      type: 'float',
    },
    date: {
      type: 'date',
      createDate: true,
    },
  },
  relations: {
    instrument: {
      type: 'many-to-one',
      target: 'Instrument',
      inverseSide: 'marketdatas',
      joinColumn: {
        name: 'instrumentid',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
