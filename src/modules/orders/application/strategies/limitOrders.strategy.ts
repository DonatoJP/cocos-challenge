import { Injectable, OnModuleInit } from '@nestjs/common';
import { Order } from '../../domain/orders.model';
import { IOrderStrategy } from './order.strategy';
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../domain/orders.constants';
import { OrdersService } from '../orders.service';
import { OrdersRepository } from '../../infrastructure/orders.repository';
import { INewOrder } from '../../domain/orders.types';

@Injectable()
export class LimitOrdersStrategy implements IOrderStrategy, OnModuleInit {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  onModuleInit() {
    this.ordersService.registerStrategy(OrderType.LIMIT, this);
  }
  async createOrder(newOrder: INewOrder): Promise<Order> {
    if (
      newOrder.side === OrderSide.CASH_IN ||
      newOrder.side === OrderSide.CASH_OUT
    ) {
      throw new Error('Limit cash in/out orders are not allowed');
    }

    const order = Order.from({
      ...newOrder,
      type: OrderType.LIMIT,
      status: OrderStatus.NEW,
    });

    return this.ordersRepository.create(order);
  }
}
