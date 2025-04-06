import { INewOrder } from '../../domain/orders.types';

export const defineNewOrderSize = (newOrder: INewOrder): number => {
  return (
    newOrder.size ||
    Math.floor(Number(newOrder.amount) / Number(newOrder.price))
  );
};
