import { Inject, Injectable } from '@nestjs/common';
import { INewOrder, TOrderType } from '../domain/orders.types';
import { IOrderStrategy } from './strategies/order.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { Order } from '../domain/orders.model';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';
import { defineNewOrderSize } from './helpers';

@Injectable()
export class OrdersService {
  private readonly ordersStrategies: Map<TOrderType, IOrderStrategy> =
    new Map();
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(MARKET_ACCESS_PORT) private readonly marketPort: MarketAccessPort,
  ) {}

  registerStrategy(type: TOrderType, strategy: IOrderStrategy) {
    if (this.ordersStrategies.has(type)) {
      throw new Error(`Strategy for order type ${type} already registered`);
    }

    this.ordersStrategies.set(type, strategy);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.getAll();
  }

  async createOrder(newOrder: INewOrder): Promise<Order> {
    const strategy = this.ordersStrategies.get(newOrder.type);
    if (!strategy) {
      throw new Error(`Strategy for order type ${newOrder.type} not found`);
    }

    const instrument = await this.marketPort.getInstrumentByTicker(
      newOrder.instrumentTicker,
    );

    return strategy.createOrder({
      ...newOrder,
      instrumentid: instrument?.id,
      size: defineNewOrderSize(newOrder),
    });
  }
}
