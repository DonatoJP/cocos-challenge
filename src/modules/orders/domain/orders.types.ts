import { OrderSide, OrderStatus, OrderType } from './orders.constants';

export type TOrderSide = keyof typeof OrderSide;
export type TOrderType = keyof typeof OrderType;
export type TOrderStatus = keyof typeof OrderStatus;
