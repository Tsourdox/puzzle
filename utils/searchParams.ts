import { z } from 'zod';

export type SearchParams = { [key: string]: string | string[] | undefined };

export function parseEnum<T extends [string, ...string[]]>(
  value: unknown,
  schema: z.ZodEnum<T>,
  defaultValue: T[number],
) {
  const result = schema.safeParse(value);
  return result.success ? result.data : defaultValue;
}
