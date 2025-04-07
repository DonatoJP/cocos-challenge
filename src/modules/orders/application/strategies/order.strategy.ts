import { IOrder, Order } from '../../domain/orders.model';
import { IPortfolioImpact } from '../../domain/portfolio.model';

export interface IOrderStrategy {
  createOrder(order: Partial<Order>): Promise<Order>;
  getPortfolioImpact(order: IOrder): IPortfolioImpact;
}
