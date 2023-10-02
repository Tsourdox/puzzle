import { Locale, T } from '@/locales';
import { PropsWithChildren } from 'react';

export type PropsWithClassName<T = {}> = PropsWithChildren<{ className?: string } & T>;
export type PropsWithLangParam = PropsWithChildren<{ params: { lang: Locale } }>;
export type PropsWithTranslation = PropsWithChildren<{ t: T }>;

export const invert = (state: boolean) => !state;
