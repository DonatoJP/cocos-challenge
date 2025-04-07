import { Injectable } from '@nestjs/common';
import { OrdersAccessPort } from 'src/ports/orders.port';
import { IPortfolio } from '../../domain/portfolio.model';
import { OrdersRepository } from '../../infrastructure/orders.repository';
import { OrdersService } from '../../application/orders.service';

@Injectable()
export class OrdersAdapter implements OrdersAccessPort {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly ordersService: OrdersService,
  ) {}

  async calculateAssetPortfolioForUser(userId: number): Promise<IPortfolio> {
    const orders = await this.ordersRepository.getUserOrders(userId);

    const porfolioImpacts = orders.map((order) => ({
      ...order,
      portfolioImpact: this.ordersService.getOrderPortfolioImpact(order),
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
}
