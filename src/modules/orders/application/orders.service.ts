import { Inject, Injectable } from '@nestjs/common';
import { INewOrder, TOrderType } from '../domain/orders.types';
import { IOrderStrategy } from './strategies/order.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { IOrder, Order } from '../domain/orders.model';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';
import {
  IPortfolio,
  IPortfolioImpact,
  IPortfolioPerformance,
} from '../domain/portfolio.model';
import { OrderSide, OrderStatus } from '../domain/orders.constants';
import { InvalidNewOrderInput, OrderNotFound } from '../domain/orders.errors';
import { IMarketData } from 'src/modules/market/domain/marketData.model';
import { roundDecimals } from 'src/lib/helpers';
import { InstrumentTypes } from 'src/modules/market/domain/market.constants';

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

    const [instrument, portfolio] = await Promise.all([
      this.marketPort.getInstrumentByTicker(newOrder.instrumentTicker),
      this.calculateAssetPortfolioForUser(newOrder.userid),
    ]);

    if (!instrument) {
      throw new InvalidNewOrderInput(
        `Instrument ${newOrder.instrumentTicker} not found`,
      );
    }

    if (
      instrument.type === InstrumentTypes.MONEDA &&
      newOrder.side !== OrderSide.CASH_IN &&
      newOrder.side !== OrderSide.CASH_OUT
    ) {
      throw new InvalidNewOrderInput(
        `Only cash in/out orders are allowed for ${instrument.ticker}`,
      );
    }

    return strategy.createOrder(
      {
        ...newOrder,
        instrumentid: instrument?.id,
      },
      portfolio,
    );
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.getById(orderId);
    if (order?.status !== OrderStatus.NEW) throw new OrderNotFound();

    return this.ordersRepository.updateById(orderId, {
      status: OrderStatus.CANCELLED,
    }) as Order;
  }

  async calculateAssetPortfolioForUser(
    userId: number,
    { includePnl }: { includePnl?: boolean } = {},
  ): Promise<IPortfolio> {
    const orders = await this.ordersRepository.getUserOrders(userId);

    const porfolioImpacts = orders.map((order) => ({
      ...order,
      portfolioImpact: this.getOrderPortfolioImpact(order),
    }));

    let available = 0;
    const assets = {};

    porfolioImpacts.forEach((order) => {
      if (order.portfolioImpact) {
        available += order.portfolioImpact.fiat;
        if (order.instrumentid && !(order.instrumentid in assets)) {
          assets[order.instrumentid] = 0;
        }

        assets[order.instrumentid!] += order.portfolioImpact.asset;
      }
    });

    let latestMarketData: (IMarketData | null)[] = [];
    if (includePnl) {
      const instrumentIds = orders
        .map((o) => o.instrumentid)
        .filter((o) => o !== undefined);

      latestMarketData = await Promise.all(
        instrumentIds.map((iid) => this.marketPort.getLatestMarketData(iid)),
      );
    }

    return {
      userid: userId,
      available,
      assets: Object.entries(assets)
        .map(([instrumentid, size]) => {
          const md = latestMarketData.find(
            (lmd) => lmd && lmd.instrumentid === +instrumentid,
          );
          return {
            instrumentid: Number(instrumentid),
            size: Number(size),
            ...(includePnl && md && this.getDailyPerformance(Number(size), md)),
          };
        })
        .filter((pa) => pa.size !== 0),
    };
  }

  private getDailyPerformance(
    orderSize: number,
    latestMarketData: IMarketData,
  ): IPortfolioPerformance {
    return {
      total: orderSize * Number(latestMarketData.close),
      performance: roundDecimals(
        ((Number(latestMarketData.close) -
          Number(latestMarketData.previousclose)) /
          Number(latestMarketData.previousclose)) *
          100,
      ),
      pnl: roundDecimals(
        orderSize *
          (Number(latestMarketData.close) -
            Number(latestMarketData.previousclose)),
      ),
    };
  }

  private getOrderPortfolioImpact(order: IOrder): IPortfolioImpact {
    const strategy = this.ordersStrategies.get(order.type as TOrderType);
    if (!strategy) {
      throw new Error(`Strategy for order type ${order.type} not found`);
    }

    return strategy.getPortfolioImpact(order);
  }
}
