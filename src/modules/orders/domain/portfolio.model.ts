export interface IPortfolioPerformance {
  total?: number;
  performance?: number;
  pnl?: number;
}

export interface IPortfolioAsset extends IPortfolioPerformance {
  instrumentid: number;
  size: number;
}

export interface IPortfolio {
  userid: number;
  available: number;
  assets: IPortfolioAsset[];
}

export interface IPortfolioImpact {
  fiat: number;
  asset: number;
}

export interface IBalances {
  fiat: number;
  assets: Record<number, number>;
}
