export interface IMarketData<I = any> {
  id?: number;
  instrumentid?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  previousclose?: number;
  date?: Date;
  instrument?: I;
}

export class MarketData implements IMarketData {
  public instrument?: any;
  constructor(
    public id?: number,
    public instrumentid?: number,
    public high?: number,
    public low?: number,
    public open?: number,
    public close?: number,
    public previousclose?: number,
    public date?: Date,
  ) {}

  static from(data: IMarketData): MarketData {
    const marketData = new MarketData(
      data.id,
      data.instrumentid,
      data.high,
      data.low,
      data.open,
      data.close,
      data.previousclose,
      data.date,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (data.instrument) marketData.instrument = data.instrument;

    return marketData;
  }
}
