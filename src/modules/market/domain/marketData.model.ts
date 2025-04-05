export interface IMarketData {
  id?: number;
  instrumentid?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  previousClose?: number;
  date?: Date;
}

export class MarketData implements IMarketData {
  constructor(
    public id?: number,
    public instrumentid?: number,
    public high?: number,
    public low?: number,
    public open?: number,
    public close?: number,
    public previousClose?: number,
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
      data.previousClose,
      data.date,
    );

    return marketData;
  }
}
