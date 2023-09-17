import { PropsWithChildren } from 'react';

export type PropsWithClassName<T = {}> = PropsWithChildren<{ className?: string } & T>;

export const invert = (state: boolean) => !state;
