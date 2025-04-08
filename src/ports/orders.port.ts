import { Order } from 'src/modules/orders/domain/orders.model';
import { TOrderStatus } from 'src/modules/orders/domain/orders.types';
import { IPortfolio } from 'src/modules/orders/domain/portfolio.model';

export interface OrdersAccessPort {
  calculateAssetPortfolioForUser(userId: number): Promise<IPortfolio>;
}

export const ORDERS_ACCESS_PORT = Symbol('OrdersAccessPort');

export interface IOrderMessageBrokerPort {
  orderCreated(order: Order): void;
  orderStatusUpdated(
    order: Order,
    oldStatus: TOrderStatus,
    newStatus: TOrderStatus,
  ): void;
}

export const ORDERS_MESSAGE_BROKER = Symbol('IOrderMessageBrokerPort');

export enum OrderMessages {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED',
}
