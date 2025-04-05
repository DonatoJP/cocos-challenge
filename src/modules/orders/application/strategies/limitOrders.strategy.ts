import { Injectable, OnModuleInit } from '@nestjs/common';
import { Order } from '../../domain/orders.model';
import { IOrderStrategy } from './order.strategy';
import { OrderType } from '../../domain/orders.constants';
import { OrdersService } from '../orders.service';

@Injectable()
export class LimitOrdersStrategy implements IOrderStrategy, OnModuleInit {
  constructor(private readonly ordersService: OrdersService) {}

  onModuleInit() {
    this.ordersService.registerStrategy(OrderType.LIMIT, this);
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    return Promise.resolve(order);
  }
}
