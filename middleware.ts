import Negotiator from 'negotiator';
import { NextRequest } from 'next/server';
import { getLocales } from './locales';

const locales = getLocales();

function getLocale(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries());
  const negotiator = new Negotiator({ headers });
  const language = negotiator.language(locales);
  return language;
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return Response.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};
