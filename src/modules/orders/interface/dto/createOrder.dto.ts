import { z } from 'zod';
import { OrderType } from '../../domain/orders.constants';
import { OrderSide } from '../../domain/orders.constants';

export const createOrderSchema = z
  .object({
    userId: z.number().int(),
    instrumentTicker: z.string(),
    side: z.nativeEnum(OrderSide),
    type: z.nativeEnum(OrderType),
    price: z.number().positive(),
  })
  .and(
    z.union([
      z.object({
        amount: z.number().positive(), // Amount in pesos
        size: z.never(),
      }),
      z.object({
        amount: z.never(),
        size: z.number().int().positive(),
      }),
    ]),
  );

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
