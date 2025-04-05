import { TInstrumentType } from './market.types';

export interface IInstrument {
  id?: number;
  ticker?: string;
  name?: string;
  type?: TInstrumentType;
}

export class Instrument implements IInstrument {
  constructor(
    public id?: number,
    public ticker?: string,
    public name?: string,
    public type?: TInstrumentType,
  ) {}

  static from(data: IInstrument): Instrument {
    const instrument = new Instrument(
      data.id,
      data.ticker,
      data.name,
      data.type,
    );

    return instrument;
  }
}
