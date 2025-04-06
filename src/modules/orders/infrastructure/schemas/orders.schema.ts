import { EntitySchema } from 'typeorm';
import { Order } from '../../domain/orders.model';

export const OrderSchema = new EntitySchema<Order>({
  name: 'Order',
  target: Order,
  tableName: 'orders',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      generated: true,
    },
    instrumentid: {
      type: 'integer',
    },
    userid: {
      type: 'integer',
    },
    size: {
      type: 'integer',
    },
    price: {
      type: 'numeric',
    },
    type: {
      type: 'varchar',
    },
    status: {
      type: 'varchar',
    },
    side: {
      type: 'varchar',
    },
    datetime: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'orders',
      joinColumn: {
        name: 'userid',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});
