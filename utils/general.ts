import type { Lang } from '@/language';
import { PropsWithChildren } from 'react';

export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export type PropsWithClassName<T = object> = PropsWithChildren<{ className?: string } & T>;
// Align with Next.js App Router expectations: params is a plain object.
// Keep `lang` as string here to avoid narrowing that conflicts with Next's types.
export type PropsWithLangParam = PropsWithChildren<{ params: Promise<{ lang: string }> }>;
export type PropsWithLang = PropsWithChildren<{ lang: Lang }>;

export const invert = (state: boolean) => !state;
