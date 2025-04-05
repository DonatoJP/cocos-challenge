import { Injectable, OnModuleInit } from '@nestjs/common';
import { Order } from '../../domain/orders.model';
import { IOrderStrategy } from './order.strategy';
import { OrderStatus, OrderType } from '../../domain/orders.constants';
import { OrdersService } from '../orders.service';
import { INewOrder } from '../../domain/orders.types';
import { OrdersRepository } from '../../infrastructure/orders.repository';

@Injectable()
export class MarketOrdersStrategy implements IOrderStrategy, OnModuleInit {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  onModuleInit() {
    this.ordersService.registerStrategy(OrderType.MARKET, this);
  }

  async createOrder(newOrder: INewOrder): Promise<Order> {
    const order = Order.from({
      ...newOrder,
      type: OrderType.MARKET,
      status: OrderStatus.FILLED,
    });

    return this.ordersRepository.create(order);
  }
}
