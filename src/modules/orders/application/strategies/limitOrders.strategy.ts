import { Injectable, OnModuleInit } from '@nestjs/common';
import { IOrder, Order } from '../../domain/orders.model';
import { OrderStrategy } from './order.strategy';
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../domain/orders.constants';
import { OrdersService } from '../orders.service';
import { OrdersRepository } from '../../infrastructure/orders.repository';
import { INewOrder, TOrderSide, TOrderStatus } from '../../domain/orders.types';
import { defineNewOrderSize } from '../helpers';
import { IPortfolio, IPortfolioImpact } from '../../domain/portfolio.model';

@Injectable()
export class LimitOrdersStrategy extends OrderStrategy implements OnModuleInit {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersRepository: OrdersRepository,
  ) {
    super();
  }

  onModuleInit() {
    this.ordersService.registerStrategy(OrderType.LIMIT, this);
  }

  async createOrder(
    newOrder: INewOrder,
    portfolio: IPortfolio,
  ): Promise<Order> {
    if (
      newOrder.side === OrderSide.CASH_IN ||
      newOrder.side === OrderSide.CASH_OUT
    ) {
      throw new Error('Limit cash in/out orders are not allowed');
    }

    const order = Order.from({
      ...newOrder,
      type: OrderType.LIMIT,
      size: defineNewOrderSize(newOrder),
    });

    order.status = this._determineOrderStatus(
      order,
      portfolio,
      OrderStatus.NEW,
    );
    return this.ordersRepository.create(order);
  }

  getPortfolioImpact(order: IOrder): IPortfolioImpact {
    const orderStatus: TOrderStatus = order.status as TOrderStatus;
    const orderSide: TOrderSide = order.side as TOrderSide;
    let fiat = 0;
    let asset = 0;
    if (orderStatus === OrderStatus.NEW || orderStatus === OrderStatus.FILLED) {
      const assetTotal = Number(order.size || 0);
      const fiatTotal = assetTotal * Number(order.price || 0);

      if (orderSide === OrderSide.BUY) {
        fiat -= fiatTotal;
        if (orderStatus === OrderStatus.FILLED) {
          asset += assetTotal;
        }
      } else if (orderSide === OrderSide.SELL) {
        asset -= assetTotal;
        if (orderStatus === OrderStatus.FILLED) {
          fiat += fiatTotal;
        }
      }
    }

    return {
      fiat,
      asset,
    };
  }
}
