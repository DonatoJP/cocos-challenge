import { OrderSide, OrderStatus, OrderType } from './orders.constants';

export type TOrderSide = keyof typeof OrderSide;
export type TOrderType = keyof typeof OrderType;
export type TOrderStatus = keyof typeof OrderStatus;

export interface INewOrder {
  userid: number;
  instrumentTicker: string;
  instrumentid?: number;
  price?: number;
  size?: number;
  amount?: number;
  side: TOrderSide;
  type: TOrderType;
}
