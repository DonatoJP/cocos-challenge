import { OrderSide, OrderStatus } from '../../domain/orders.constants';
import { IOrder, Order } from '../../domain/orders.model';
import { TOrderStatus } from '../../domain/orders.types';
import { IPortfolio, IPortfolioImpact } from '../../domain/portfolio.model';

export interface IOrderStrategy {
  createOrder(order: IOrder, portfolio: IPortfolio): Promise<Order>;
  getPortfolioImpact(order: IOrder): IPortfolioImpact;
}

export abstract class OrderStrategy implements IOrderStrategy {
  abstract createOrder(order: IOrder, portfolio: IPortfolio): Promise<Order>;
  abstract getPortfolioImpact(order: IOrder): IPortfolioImpact;

  protected _determineOrderStatus(
    order: IOrder,
    portfolio: IPortfolio,
    initialStatus: TOrderStatus = OrderStatus.NEW,
  ): TOrderStatus {
    const assetTotal = Number(order.size || 0);
    const fiatTotal = assetTotal * Number(order.price || 0);
    if (order.side === OrderSide.CASH_IN || order.side === OrderSide.CASH_OUT) {
      return order.side === OrderSide.CASH_IN ||
        portfolio.available >= assetTotal
        ? OrderStatus.FILLED
        : OrderStatus.REJECTED;
    }

    if (order.side === OrderSide.BUY) {
      return Number(order.size) > 0 && portfolio.available >= fiatTotal
        ? initialStatus
        : OrderStatus.REJECTED;
    } else if (order.side === OrderSide.SELL) {
      const portfolioAsset = portfolio.assets.find(
        (pa) => pa.instrumentid === order.instrumentid,
      );
      return portfolioAsset &&
        Number(order.size) > 0 &&
        portfolioAsset.size >= assetTotal
        ? initialStatus
        : OrderStatus.REJECTED;
    }

    return OrderStatus.REJECTED;
  }
}
