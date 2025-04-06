import { Injectable } from '@nestjs/common';
import { Order } from '../domain/orders.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/lib/database/base.repository';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(
    @InjectRepository(Order)
    repository: Repository<Order>,
  ) {
    super(repository);
  }

  async getUserOrders(userid: number) {
    return this.getBy('userid', userid, {
      order: {
        datetime: 'DESC',
      },
    });
  }
}
