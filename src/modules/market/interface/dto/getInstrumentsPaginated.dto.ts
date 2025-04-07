import { z } from 'zod';

export const getInstrumentsPaginatedSchema = z.object({
  name: z.string().optional(),
  ticker: z.string().optional(),
  limit: z
    .string()
    .refine((val) => /^\d+$/.test(val))
    .optional()
    .default('10'),
  page: z
    .string()
    .refine((val) => /^\d+$/.test(val))
    .optional()
    .default('0'),
});

export type GetInstrumentsPaginatedDTO = z.infer<
  typeof getInstrumentsPaginatedSchema
>;
