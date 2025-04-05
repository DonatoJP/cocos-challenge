import { z } from 'zod';
import { OrderType } from '../../domain/orders.constants';
import { OrderSide } from '../../domain/orders.constants';

export const createOrderSchema = z.object({
  userId: z.string(),
  instrumentTicker: z.string(),
  amount: z.number().positive(), // Amount in pesos
  size: z.number().int().positive(),
  side: z.nativeEnum(OrderSide),
  type: z.nativeEnum(OrderType),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
