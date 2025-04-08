import { IOrderMessageBrokerPort, OrderMessages } from 'src/ports/orders.port';
import { Order } from '../../domain/orders.model';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TOrderStatus } from '../../domain/orders.types';

@Injectable()
export class OrderEventsPort implements IOrderMessageBrokerPort {
  private readonly logger = new Logger(OrderEventsPort.name);
  constructor(private readonly eventEmmitter: EventEmitter2) {}

  orderCreated(order: Order): void {
    this.logger.debug(`Sending message ${OrderMessages.ORDER_CREATED}`);
    this.eventEmmitter.emit(OrderMessages.ORDER_CREATED, { order });
  }

  orderStatusUpdated(
    order: Order,
    oldStatus: TOrderStatus,
    newStatus: TOrderStatus,
  ): void {
    this.logger.debug(`Sending message ${OrderMessages.ORDER_STATUS_UPDATED}`);
    this.eventEmmitter.emit(OrderMessages.ORDER_STATUS_UPDATED, {
      order,
      oldStatus,
      newStatus,
    });
  }
}
