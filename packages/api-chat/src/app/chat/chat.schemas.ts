import { z } from 'zod';

export const createMessageSchema = z.object({
  text: z.string().min(1),
});
