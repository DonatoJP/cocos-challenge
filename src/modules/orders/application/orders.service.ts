import { Injectable } from '@nestjs/common';
import { TOrderType } from '../domain/orders.types';
import { IOrderStrategy } from './strategies/order.strategy';

@Injectable()
export class OrdersService {
  private readonly ordersStrategies: Map<TOrderType, IOrderStrategy> =
    new Map();
  constructor() {}

  registerStrategy(type: TOrderType, strategy: IOrderStrategy) {
    if (this.ordersStrategies.has(type)) {
      throw new Error(`Strategy for order type ${type} already registered`);
    }

    this.ordersStrategies.set(type, strategy);
  }
}
