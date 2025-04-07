import { Injectable } from '@nestjs/common';
import { OrdersAccessPort } from 'src/ports/orders.port';
import { IPortfolio } from '../../domain/portfolio.model';
import { OrdersService } from '../../application/orders.service';

@Injectable()
export class OrdersAdapter implements OrdersAccessPort {
  constructor(private readonly ordersService: OrdersService) {}

  async calculateAssetPortfolioForUser(userId: number): Promise<IPortfolio> {
    return this.ordersService.calculateAssetPortfolioForUser(userId);
  }
}
