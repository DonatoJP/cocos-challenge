import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderMessages } from 'src/ports/orders.port';
import { Order } from '../../domain/orders.model';
import { OrdersService } from '../../application/orders.service';
import { OrderStatus } from '../../domain/orders.constants';

@Injectable()
export class OrderEventsConsumer {
  constructor(private readonly ordersService: OrdersService) {}

  @OnEvent(OrderMessages.ORDER_CREATED)
  async handleOrderCreated(event: { order: Order }) {
    if (event.order.userid && event.order.status !== OrderStatus.REJECTED)
      await this.ordersService.invalidateBalanceCache(event.order.userid);
  }

  @OnEvent(OrderMessages.ORDER_STATUS_UPDATED)
  async handleOrderStatusUpdated(event: { order: Order }) {
    if (event.order.userid && event.order.status !== OrderStatus.REJECTED)
      await this.ordersService.invalidateBalanceCache(event.order.userid);
  }
}
