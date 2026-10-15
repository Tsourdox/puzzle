import App from '@/app/App';
import type { Page } from '@/app/pages';
import { getLangs, getTranslation } from '@/language';
import { renderToString } from 'react-dom/server';
import type { Manifest } from '../scripts/build';

const ORIGIN = 'https://puzzelin.se';

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Page data goes into a <script>; this keeps "</script>" in it from ending the tag
const escapeJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

function getMeta(page: Page) {
  const t = getTranslation(page.lang);
  const description =
    page.name === 'room'
      ? t(
          'Select pieces and drag and rotate them to solve the puzzle. Invite your friends to help you!',
        )
      : t(
          'A free and open-source online puzzle where friends and family can help each other and solve fun puzzles together!',
        );
  const title =
    page.name === 'room'
      ? `Puzzelin - ${t('In Room')} ${page.roomCode}`
      : `Puzzelin - ${t('An online puzzle for you and your friends!')}`;
  return {
    title,
    description,
    keywords: t('puzzle, online, friends, family, social, fun, collaboration, free, open source'),
  };
}

/** The whole HTML document: server-rendered app, plus what the browser needs to hydrate it */
export function renderPage(page: Page, pathname: string, manifest: Manifest) {
  const { title, description, keywords } = getMeta(page);
  const app = renderToString(<App page={page} pathname={pathname} />);
  // Same page in the other languages, for search engines
  const rest = pathname.split('/').slice(2).join('/');
  const alternates = getLangs()
    .map((lang) => {
      const href = `${ORIGIN}/${lang}${rest ? `/${rest}` : ''}`;
      return `<link rel="alternate" hreflang="${lang}" href="${escapeHtml(href)}">`;
    })
    .join('');

  return `<!doctype html>
<html lang="${page.lang}" class="h-full">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="keywords" content="${escapeHtml(keywords)}">
<meta name="author" content="David Jensen">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${ORIGIN}/images/logo-bg.png">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/black-ops-one.ttf" as="font" type="font/ttf" crossorigin>
<style>@font-face{font-family:'Black Ops One';src:url('/fonts/black-ops-one.ttf') format('truetype');font-display:swap}</style>
${alternates}
${manifest.css.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}
<script type="module" src="${manifest.js}" async></script>
</head>
<body class="relative min-h-full flex flex-col text-zinc-100 bg-zinc-950">
<div id="root" class="flex flex-1 flex-col">${app}</div>
<script>window.__PAGE__=${escapeJson(page)}</script>
</body>
</html>`;
}
