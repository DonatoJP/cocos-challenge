import { Order } from '../../domain/orders.model';

export interface IOrderStrategy {
  createOrder(order: Partial<Order>): Promise<Order>;
}
