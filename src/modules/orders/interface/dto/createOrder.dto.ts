import { z } from 'zod';
import { OrderType } from '../../domain/orders.constants';
import { OrderSide } from '../../domain/orders.constants';

const baseFields = {
  userid: z.number().int(),
  instrumentTicker: z.string(),
  side: z.nativeEnum(OrderSide),
};

const amountOrSize = z.union(
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
      message: 'You must define either amount or size as numbers, but not both',
    }),
  },
);

const limitOrderSchema = z.object({
  ...baseFields,
  type: z.literal(OrderType.LIMIT),
  price: z.number({ message: 'Price is required for LIMIT orders' }).positive(),
});

const marketOrderSchema = z.object({
  ...baseFields,
  type: z.literal(OrderType.MARKET),
  price: z.undefined({ message: 'Price is not required for MARKET orders' }),
});

export const createOrderSchema = z
  .discriminatedUnion('type', [limitOrderSchema, marketOrderSchema])
  .and(amountOrSize);

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
