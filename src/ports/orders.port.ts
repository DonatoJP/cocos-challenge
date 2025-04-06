import { IPortfolio } from 'src/modules/orders/domain/portfolio.model';

export interface OrdersAccessPort {
  calculateAssetPortfolioForUser(userId: number): Promise<IPortfolio>;
}

export const ORDERS_ACCESS_PORT = Symbol('OrdersAccessPort');
