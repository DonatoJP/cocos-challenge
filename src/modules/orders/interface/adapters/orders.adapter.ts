import { Injectable } from '@nestjs/common';
import { OrdersAccessPort } from 'src/ports/orders.port';
import { IPortfolio } from '../../domain/portfolio.model';
import { OrdersRepository } from '../../infrastructure/orders.repository';
import { Order } from '../../domain/orders.model';
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../domain/orders.constants';

const calculateAssetPortfolio = (orders: Order[]): IPortfolio => {
  let availableAmount = 0;
  const assets = {};

  orders.forEach((o) => {
    if (o.instrumentid && !(o.instrumentid in assets)) {
      assets[o.instrumentid] = 0;
    }
    const assetTotal = Number(o.size);
    const fiatTotal = assetTotal * Number(o.price);

    if (o.side === OrderSide.CASH_IN) {
      availableAmount += fiatTotal;
    } else if (o.side === OrderSide.CASH_OUT) {
      availableAmount -= fiatTotal;
    } else if (o.type === OrderType.LIMIT) {
      if (
        o.side === OrderSide.BUY &&
        (o.status === OrderStatus.NEW || o.status === OrderStatus.FILLED)
      ) {
        availableAmount -= fiatTotal;
        if (o.status === OrderStatus.FILLED) {
          assets[o.instrumentid!] += assetTotal;
        }
      } else if (
        o.side === OrderSide.SELL &&
        (o.status === OrderStatus.NEW || o.status === OrderStatus.FILLED)
      ) {
        assets[o.instrumentid!] -= assetTotal;
        if (o.status === OrderStatus.FILLED) {
          availableAmount += fiatTotal;
        }
      }
    } else if (o.type === OrderType.MARKET && o.status === OrderStatus.FILLED) {
      if (o.side === OrderSide.BUY) {
        availableAmount -= fiatTotal;
        assets[o.instrumentid!] += assetTotal;
      } else if (o.side === OrderSide.SELL) {
        availableAmount += fiatTotal;
        assets[o.instrumentid!] -= assetTotal;
      }
    }
  });

  return {
    userid: orders[0].userid || 0,
    available: availableAmount,
    assets: Object.entries(assets).map(([instrumentid, size]) => ({
      instrumentid: Number(instrumentid),
      size: Number(size),
    })),
  };
};

@Injectable()
export class OrdersAdapter implements OrdersAccessPort {
  constructor(private readonly ordersRepository: OrdersRepository) {}
  async calculateAssetPortfolioForUser(userId: number): Promise<IPortfolio> {
    const orders = await this.ordersRepository.getUserOrders(userId);

    return calculateAssetPortfolio(orders);
  }
}
