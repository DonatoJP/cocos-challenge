export interface IPortfolioAsset {
  instrumentid: number;
  size: number;
  total?: number;
  pnl?: number;
}

export interface IPortfolio {
  userid: number;
  available: number;
  assets: IPortfolioAsset[];
}
