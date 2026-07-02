import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const schema = z.object({ email: z.string().email() });
  const pipe = new ZodValidationPipe(schema);

  it('returns the parsed value when valid', () => {
    expect(pipe.transform({ email: 'a@b.com' }, {} as never)).toEqual({ email: 'a@b.com' });
  });

  it('throws BadRequestException when invalid', () => {
    expect(() => pipe.transform({ email: 'not-an-email' }, {} as never)).toThrow(BadRequestException);
  });
});
