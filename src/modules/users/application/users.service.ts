import { Inject, Injectable } from '@nestjs/common';
import { IPortfolio } from '../../orders/domain/portfolio.model';
import { ORDERS_ACCESS_PORT, OrdersAccessPort } from 'src/ports/orders.port';

@Injectable()
export class UsersService {
  constructor(
    @Inject(ORDERS_ACCESS_PORT) private readonly ordersPort: OrdersAccessPort,
  ) {}

  async getUserPortfolio(userId: number): Promise<IPortfolio | null> {
    return this.ordersPort.calculateAssetPortfolioForUser(userId);
  }
}
