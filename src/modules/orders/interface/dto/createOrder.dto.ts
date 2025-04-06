import { z } from 'zod';
import { OrderType } from '../../domain/orders.constants';
import { OrderSide } from '../../domain/orders.constants';

export const createOrderSchema = z
  .object({
    userid: z.number().int(),
    instrumentTicker: z.string(),
    side: z.nativeEnum(OrderSide),
    type: z.nativeEnum(OrderType),
    price: z.number().positive(),
  })
  .and(
    z.union(
      [
        z.object(
          {
            amount: z.number().positive(), // Amount in pesos
            size: z.undefined(),
          },
          {
            message: 'Amount must be a positive number',
          },
        ),
        z.object(
          {
            amount: z.undefined(),
            size: z.number().int().positive(),
          },
          {
            message: 'Size must be a positive number',
          },
        ),
      ],
      {
        errorMap: () => ({
          message:
            'You must define either amount or size as numbers, but not both',
        }),
      },
    ),
  );

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
