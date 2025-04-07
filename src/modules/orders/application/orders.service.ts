import { Inject, Injectable } from '@nestjs/common';
import { INewOrder, TOrderType } from '../domain/orders.types';
import { IOrderStrategy } from './strategies/order.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { IOrder, Order } from '../domain/orders.model';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';
import { IPortfolio, IPortfolioImpact } from '../domain/portfolio.model';

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

    return strategy.createOrder(
      {
        ...newOrder,
        instrumentid: instrument?.id,
      },
      portfolio,
    );
  }

  async calculateAssetPortfolioForUser(userId: number): Promise<IPortfolio> {
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

    return {
      userid: userId,
      available,
      assets: Object.entries(assets).map(([instrumentid, size]) => ({
        instrumentid: Number(instrumentid),
        size: Number(size),
      })),
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
