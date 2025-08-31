import { Lang } from '@/language';
import { PropsWithChildren } from 'react';

export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export type PropsWithClassName<T = {}> = PropsWithChildren<{ className?: string } & T>;
export type PropsWithLangParam = PropsWithChildren<{ params: Promise<{ lang: Lang }> }>;
export type PropsWithLang = PropsWithChildren<{ lang: Lang }>;

export const invert = (state: boolean) => !state;
