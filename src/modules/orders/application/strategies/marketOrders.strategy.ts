import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IOrder, Order } from '../../domain/orders.model';
import { IOrderStrategy } from './order.strategy';
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../domain/orders.constants';
import { OrdersService } from '../orders.service';
import { INewOrder, TOrderSide, TOrderStatus } from '../../domain/orders.types';
import { OrdersRepository } from '../../infrastructure/orders.repository';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';
import { defineNewOrderSize } from '../helpers';
import { IPortfolioImpact } from '../../domain/portfolio.model';

@Injectable()
export class MarketOrdersStrategy implements IOrderStrategy, OnModuleInit {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersRepository: OrdersRepository,
    @Inject(MARKET_ACCESS_PORT) private readonly marketPort: MarketAccessPort,
  ) {}

  onModuleInit() {
    this.ordersService.registerStrategy(OrderType.MARKET, this);
  }

  async createOrder(newOrder: INewOrder): Promise<Order> {
    let newMarketOrder: IOrder;
    if (
      newOrder.side === OrderSide.CASH_IN ||
      newOrder.side === OrderSide.CASH_OUT
    ) {
      if (!newOrder.size) {
        throw new Error('Size is required for cash in / out orders'); // Improvement: Throw custom module errors
      }

      newMarketOrder = {
        ...newOrder,
        price: 1,
        type: OrderType.MARKET,
        status: OrderStatus.FILLED,
      };
    } else {
      const latestMarketPrice = await this.marketPort.getLatestMarketPrice(
        newOrder.instrumentid!,
      );

      newMarketOrder = {
        ...newOrder,
        price: latestMarketPrice!, // ignore price, it will be equal to latest market price
        type: OrderType.MARKET,
        status: OrderStatus.FILLED,
      };
    }

    const order = Order.from({
      ...newMarketOrder,
      size: defineNewOrderSize(newMarketOrder as INewOrder),
    });

    return this.ordersRepository.create(order);
  }

  getPortfolioImpact(order: IOrder): IPortfolioImpact {
    const orderStatus: TOrderStatus = order.status as TOrderStatus;
    const orderSide: TOrderSide = order.side as TOrderSide;
    let fiat = 0;
    let asset = 0;

    if (orderStatus === OrderStatus.FILLED) {
      const assetTotal = Number(order.size || 0);
      const fiatTotal = assetTotal * Number(order.price || 0);
      if (orderSide == OrderSide.CASH_IN) fiat += fiatTotal;
      else if (orderSide == OrderSide.CASH_OUT) fiat -= fiatTotal;
      else if (orderSide === OrderSide.BUY) {
        fiat -= fiatTotal;
        asset += assetTotal;
      } else if (orderSide === OrderSide.SELL) {
        asset -= assetTotal;
        fiat += fiatTotal;
      }
    }

    return {
      fiat,
      asset,
    };
  }
}
