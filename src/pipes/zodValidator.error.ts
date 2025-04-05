import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

export class ZodValidatorError extends BadRequestException {
  validationErrors: string[];
  constructor(private readonly zodError: ZodError) {
    super('Request validation failed');
    this.validationErrors = zodError.errors.map((err) => err.message);
  }

  getResponse(): string | object {
    const superResponse = super.getResponse();
    if (typeof superResponse === 'string') {
      return super.getResponse();
    }
    return { ...superResponse, validationErrors: this.validationErrors };
  }
}
