import { Nullable } from '@typings/common';
import { z } from 'zod';

export const parseParams = <T>(params: T, schema: z.ZodType<T>) => {
  const parsedData = schema.safeParse(params);

  if (parsedData.success) {
    return parsedData.data;
  }

  console.error('parse params error', { params, error: parsedData.error });

  const errorMessages =
    parsedData?.error?.issues?.map?.((issue) => {
      const header = issue?.path?.join?.('.');
      return `${header}: ${issue?.message}`;
    }) || [];
  throw new Error(errorMessages.join('; '));
};

export const parseResponse = <T>(
  response: Nullable<T>,
  schema: z.ZodType<T>
) => {
  const parsedData = schema.safeParse(response);

  if (parsedData.success) {
    return parsedData.data;
  }

  console.error('parse response error', { response, error: parsedData.error });

  return null;
};
