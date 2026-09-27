import { ZodType } from 'zod';

export function parseParams<T>(data: unknown, schema: ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Params validation error:', result.error);
    throw new Error('Invalid request parameters');
  }
  return result.data;
}

export function parseResponse<T>(data: unknown, schema: ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Response validation error:', result.error);
    throw new Error('Invalid response data');
  }
  return result.data;
}

