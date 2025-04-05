import { PipeTransform, InternalServerErrorException } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';
import { ZodValidatorError } from './zodValidator.error';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue: T = this.schema.parse(value) as T;
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ZodValidatorError(error);
      }

      throw new InternalServerErrorException();
    }
  }
}
