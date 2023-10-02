import { Lang } from '@/locales';
import { PropsWithChildren } from 'react';

export type PropsWithClassName<T = {}> = PropsWithChildren<{ className?: string } & T>;
export type PropsWithLangParam = PropsWithChildren<{ params: { lang: Lang } }>;
export type PropsWithLang = PropsWithChildren<{ lang: Lang }>;

export const invert = (state: boolean) => !state;
