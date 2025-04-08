import { Inject, Injectable, Logger } from '@nestjs/common';
import { INewOrder, TOrderType } from '../domain/orders.types';
import { IOrderStrategy } from './strategies/order.strategy';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { IOrder, Order } from '../domain/orders.model';
import { MARKET_ACCESS_PORT, MarketAccessPort } from 'src/ports/market.port';
import {
  IBalances,
  IPortfolio,
  IPortfolioImpact,
  IPortfolioPerformance,
} from '../domain/portfolio.model';
import { OrderSide, OrderStatus } from '../domain/orders.constants';
import { InvalidNewOrderInput, OrderNotFound } from '../domain/orders.errors';
import { IMarketData } from 'src/modules/market/domain/marketData.model';
import { roundDecimals } from 'src/lib/helpers';
import { InstrumentTypes } from 'src/modules/market/domain/market.constants';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  IOrderMessageBrokerPort,
  ORDERS_MESSAGE_BROKER,
} from 'src/ports/orders.port';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly ordersStrategies: Map<TOrderType, IOrderStrategy> =
    new Map();
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(MARKET_ACCESS_PORT) private readonly marketPort: MarketAccessPort,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(ORDERS_MESSAGE_BROKER)
    private readonly ordersMessageBroker: IOrderMessageBrokerPort,
  ) {}

  registerStrategy(type: TOrderType, strategy: IOrderStrategy) {
    if (this.ordersStrategies.has(type)) {
      throw new Error(`Strategy for order type ${type} already registered`);
    }

    this.ordersStrategies.set(type, strategy);
    this.logger.debug(
      `Registered strategy for ${type}: ${strategy?.constructor?.name}`,
    );
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

    const order = await strategy.createOrder(
      {
        ...newOrder,
        instrumentid: instrument?.id,
      },
      portfolio,
    );

    this.logger.log(
      `Created order ${order.type} ${order.side} for user ${order.userid} with status ${order.status} `,
    );

    this.ordersMessageBroker.orderCreated(order);

    return order;
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.getById(orderId);
    if (order?.status !== OrderStatus.NEW) throw new OrderNotFound();

    return this.ordersRepository
      .updateById(orderId, {
        status: OrderStatus.CANCELLED,
      })
      .then((o) => {
        this.logger.log(`Cancelled order ${orderId} for user ${order.userid}`);
        this.ordersMessageBroker.orderStatusUpdated(
          order,
          order.status!,
          o!.status!,
        );
        return o;
      }) as Order;
  }

  async calculateAssetPortfolioForUser(
    userId: number,
    { includePnl }: { includePnl?: boolean } = {},
  ): Promise<IPortfolio> {
    const balances = await this.cacheManager.get<IBalances>(
      `balance_${userId}`,
    );
    let fiat = 0;
    let assets = {};
    if (!balances) {
      const orders = await this.ordersRepository.getUserOrders(userId);

      const porfolioImpacts = orders.map((order) => ({
        ...order,
        portfolioImpact: this.getOrderPortfolioImpact(order),
      }));

      porfolioImpacts.forEach((order) => {
        if (order.portfolioImpact) {
          fiat += order.portfolioImpact.fiat;
          if (order.instrumentid && !(order.instrumentid in assets)) {
            assets[order.instrumentid] = 0;
          }

          assets[order.instrumentid!] += order.portfolioImpact.asset;
        }
      });

      await this.cacheManager.set<IBalances>(`balance_${userId}`, {
        fiat,
        assets,
      });
      this.logger.debug(`Setting balance cache for user ${userId}`);
    } else {
      fiat = balances.fiat;
      assets = balances.assets;
    }

    let latestMarketData: (IMarketData | null)[] = [];
    if (includePnl) {
      const instrumentIds = Object.keys(assets);

      latestMarketData = await Promise.all(
        instrumentIds.map((iid) => this.marketPort.getLatestMarketData(+iid)),
      );
    }

    return {
      userid: userId,
      available: fiat,
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

  async invalidateBalanceCache(userid: number): Promise<void> {
    this.logger.debug(`Invalidating balance cache for user ${userid}`);
    await this.cacheManager.del(`balance_${userid}`);
  }
}
