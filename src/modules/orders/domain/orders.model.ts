import { TOrderSide, TOrderStatus, TOrderType } from './orders.types';

export interface IOrder<U = any> {
  id?: string;
  instrumentid?: number;
  userid?: number;
  size?: number;
  price?: number;
  type?: TOrderType;
  side?: TOrderSide;
  status?: TOrderStatus;
  datetime?: Date;
  user?: U;
}

export class Order implements IOrder {
  public user?: any;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (orderData.user) order.user = orderData.user;
    return order;
  }

  constructor(
    public id?: string,
    public instrumentid?: number,
    public userid?: number,
    public size?: number,
    public price?: number,
    public type?: TOrderType,
    public side?: TOrderSide,
    public status?: TOrderStatus,
    public datetime?: Date,
  ) {
    this.datetime = this.datetime || new Date();
  }
}
