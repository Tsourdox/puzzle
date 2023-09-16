import { z } from 'zod';

export const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
export const SizeEnum = z.enum(sizes);
export type Size = z.infer<typeof SizeEnum>;

export function getPiecesCountFromSize(size: Size) {
  return { xs: 4, s: 8, m: 12, l: 20, xl: 30 }[size];
}
