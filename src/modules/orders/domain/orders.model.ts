import { TOrderSide, TOrderStatus, TOrderType } from './orders.types';

export interface IOrder {
  id?: string;
  instrumentid?: number;
  userid?: string;
  size?: number;
  price?: number;
  type?: TOrderType;
  side?: TOrderSide;
  status?: TOrderStatus;
  datetime?: Date;
}

export class Order implements IOrder {
  static from(orderData: IOrder): Order {
    const order = new Order(
      orderData.id,
      orderData.instrumentid,
      orderData.userid,
      orderData.size,
      orderData.price,
      orderData.type,
      orderData.side,
      orderData.status,
      orderData.datetime,
    );
    return order;
  }

  constructor(
    public id?: string,
    public instrumentid?: number,
    public userid?: string,
    public size?: number,
    public price?: number,
    public type?: TOrderType,
    public side?: TOrderSide,
    public status?: TOrderStatus,
    public datetime?: Date,
  ) {}
}
