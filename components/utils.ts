import { PropsWithChildren } from 'react';

export type PropsWithClassName<T = {}> = PropsWithChildren<
  { className?: string } & T
>;
