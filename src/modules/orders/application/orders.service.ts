import { Injectable } from '@nestjs/common';
import { TOrderType } from '../domain/orders.types';
import { IOrderStrategy } from './strategies/order.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { Order } from '../domain/orders.model';

@Injectable()
export class OrdersService {
  private readonly ordersStrategies: Map<TOrderType, IOrderStrategy> =
    new Map();
  constructor(private readonly ordersRepository: OrdersRepository) {}

  registerStrategy(type: TOrderType, strategy: IOrderStrategy) {
    if (this.ordersStrategies.has(type)) {
      throw new Error(`Strategy for order type ${type} already registered`);
    }

    this.ordersStrategies.set(type, strategy);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.getAll();
  }
}
