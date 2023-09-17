import { z } from 'zod';

export const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
export const SizeEnum = z.enum(sizes);
export type Size = z.infer<typeof SizeEnum>;
