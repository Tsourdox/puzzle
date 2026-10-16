// Puzzelin: server-rendered pages, rooms over WebSockets persisted to SQLite, and uploaded images.
import type { Page } from '@/app/pages';
import { getLangs, type Lang } from '@/language';
import { sizes, type Size } from '@/utils/sizes';
import type { ServerWebSocket } from 'bun';
import Negotiator from 'negotiator';
import { mkdirSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { buildClient, DIST_DIR, type Manifest } from '../scripts/build';
import {
  puzzleKey,
  type ClientMessage,
  type IPieceData,
  type IPuzzleData,
  type Peer,
  type RoomSnapshot,
  type ServerMessage,
} from '../shared/protocol';
import { getGallery } from './gallery';
import Pexels from './pexels';
import { renderPage } from './render';
import Store from './store';

const DEV = process.env.NODE_ENV === 'development';
const PORT = Number(process.env.PORT ?? 3000);
const DATA_DIR = process.env.DATA_DIR ?? join(import.meta.dir, 'data');
const PUBLIC_DIR = join(import.meta.dir, '..', 'public');
const LANGS = getLangs() as Lang[];
const IMAGES_DIR = join(DATA_DIR, 'images');
/** Moved pieces are written to SQLite this often, not on every message */
const FLUSH_MS = 1000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PIECES = 10_000;
const ROOM_CODE = /^[A-Za-z0-9_-]{1,32}$/;
const COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ef4444', // red
  '#f59e0b', // amber
  '#ec4899', // pink
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#8b5cf6', // violet
];

interface WSData {
  roomCode: string;
  id: string;
  color: string;
  pieceIds: number[];
}
type WS = ServerWebSocket<WSData>;

interface Room {
  code: string;
  puzzle: IPuzzleData | null;
  pieces: Map<number, IPieceData>;
  /** Pieces moved since the last flush */
  dirty: Set<number>;
  clients: Set<WS>;
}

mkdirSync(IMAGES_DIR, { recursive: true });
const store = new Store(join(DATA_DIR, 'puzzelin.db'));
const pexels = new Pexels(store);
const rooms = new Map<string, Room>();

/* ---------------------------------- rooms --------------------------------- */

function getRoom(code: string): Room {
  let room = rooms.get(code);
  if (!room) {
    const { puzzle, pieces } = store.getRoom(code);
    room = {
      code,
      puzzle,
      pieces: new Map(pieces.map((piece) => [piece.id, piece])),
      dirty: new Set(),
      clients: new Set(),
    };
    rooms.set(code, room);
  }
  return room;
}

const snapshot = (room: Room): RoomSnapshot => ({
  puzzle: room.puzzle,
  pieces: [...room.pieces.values()],
});

const peers = (room: Room): Peer[] =>
  [...room.clients].map(({ data }) => ({
    id: data.id,
    color: data.color,
    pieceIds: data.pieceIds,
  }));

function pickColor(room: Room) {
  const taken = new Set([...room.clients].map((ws) => ws.data.color));
  return COLORS.find((color) => !taken.has(color)) ?? COLORS[room.clients.size % COLORS.length];
}

function flush() {
  for (const room of rooms.values()) {
    if (room.dirty.size) {
      const pieces = [...room.dirty].flatMap((id) => room.pieces.get(id) ?? []);
      room.dirty.clear();
      try {
        store.savePieces(room.code, pieces);
      } catch (error) {
        console.error(`Failed to save room ${room.code}:`, error);
      }
    }
    // Nobody here and nothing unsaved: it's all in SQLite, so it can leave memory
    if (!room.clients.size) rooms.delete(room.code);
  }
}

/* ------------------------------- validation ------------------------------- */

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isIdList = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length <= MAX_PIECES && value.every(Number.isInteger);

function isPuzzle(value: unknown): value is IPuzzleData {
  const puzzle = value as IPuzzleData;
  return (
    !!puzzle &&
    !!puzzle.imageData?.id &&
    isNumber(puzzle.seed) &&
    Number.isInteger(puzzle.pieceCount?.x) &&
    Number.isInteger(puzzle.pieceCount?.y) &&
    puzzle.pieceCount.x * puzzle.pieceCount.y <= MAX_PIECES
  );
}

function toPiece(value: unknown, count: number): IPieceData | null {
  const piece = value as IPieceData;
  if (
    !piece ||
    !Number.isInteger(piece.id) ||
    piece.id < 0 ||
    piece.id >= count ||
    !isNumber(piece.rotation) ||
    !isNumber(piece.translation?.x) ||
    !isNumber(piece.translation?.y) ||
    !isNumber(piece.elevation)
  ) {
    return null;
  }
  // Only keep known fields, so clients can't grow what we store
  return {
    id: piece.id,
    rotation: piece.rotation,
    translation: { x: piece.translation.x, y: piece.translation.y },
    connectedSides: isIdList(piece.connectedSides) ? piece.connectedSides.slice(0, 4) : [],
    elevation: piece.elevation,
  };
}

const toPieces = (value: unknown, puzzle: IPuzzleData) =>
  Array.isArray(value)
    ? value.flatMap((piece) => toPiece(piece, puzzle.pieceCount.x * puzzle.pieceCount.y) ?? [])
    : [];

/* -------------------------------- messages -------------------------------- */

/**
 * Nobody holds these pieces any more. Holding doesn't lock: the last one to take a piece gets
 * it, and whoever had it lets go when they hear (or never says so, if its tab is asleep).
 */
function release(room: Room, pieceIds: number[]) {
  const ids = new Set(pieceIds);
  for (const client of room.clients) {
    client.data.pieceIds = client.data.pieceIds.filter((id) => !ids.has(id));
  }
}

const send = (ws: WS, message: ServerMessage) => ws.send(JSON.stringify(message));
/** To everyone in the room except `ws` */
const publish = (ws: WS, message: ServerMessage) =>
  ws.publish(ws.data.roomCode, JSON.stringify(message));

function handleMessage(ws: WS, message: ClientMessage) {
  const room = getRoom(ws.data.roomCode);
  const { id } = ws.data;

  switch (message.type) {
    case 'create': {
      if (!isPuzzle(message.puzzle)) return;
      room.puzzle = message.puzzle;
      room.pieces = new Map(toPieces(message.pieces, room.puzzle).map((p) => [p.id, p]));
      room.dirty.clear();
      for (const client of room.clients) client.data.pieceIds = [];
      store.replaceRoom(room.code, room.puzzle, [...room.pieces.values()]);
      publish(ws, { type: 'room', room: snapshot(room) });
      console.log(`Room ${room.code}: new puzzle ${puzzleKey(room.puzzle)}`);
      return;
    }
    case 'pieces': {
      // Tells the sender where its message landed among everyone's (see 'ack')
      send(ws, { type: 'ack' });
      // Moves made in a puzzle the room has since replaced
      if (!room.puzzle || message.key !== puzzleKey(room.puzzle)) return;
      const pieces = toPieces(message.pieces, room.puzzle);
      for (const piece of pieces) {
        room.pieces.set(piece.id, piece);
        room.dirty.add(piece.id);
      }
      if (pieces.length) publish(ws, { type: 'pieces', from: id, pieces });
      return;
    }
    case 'select': {
      if (!isIdList(message.pieceIds)) return;
      release(room, message.pieceIds);
      ws.data.pieceIds = message.pieceIds;
      publish(ws, { type: 'select', from: id, pieceIds: message.pieceIds });
      return;
    }
    case 'cursor': {
      if (!isNumber(message.x) || !isNumber(message.y)) return;
      publish(ws, { type: 'cursor', from: id, x: message.x, y: message.y });
      return;
    }
    case 'connect': {
      if (!isIdList(message.pieceIds)) return;
      release(room, message.pieceIds);
      publish(ws, { type: 'connect', from: id, pieceIds: message.pieceIds });
      return;
    }
  }
}

/* ---------------------------------- http ---------------------------------- */

const json = (body: unknown, status = 200) => Response.json(body, { status });
const notFound = () => new Response('Not found', { status: 404 });
const redirect = (location: string) =>
  new Response(null, { status: 302, headers: { Location: location } });

async function uploadImage(req: Request) {
  const bytes = new Uint8Array(await req.arrayBuffer());
  // The client converts every upload to JPEG; anything else isn't ours
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg) return json({ error: 'Expected a JPEG image' }, 415);
  if (bytes.length > MAX_IMAGE_BYTES) return json({ error: 'Image too large' }, 413);

  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await Bun.write(join(IMAGES_DIR, `${id}.jpg`), bytes);
  return json({ id }, 201);
}

/** A file under `dir`, or null if it's missing or the path tries to leave `dir` */
async function serveFile(dir: string, path: string, cacheControl: string, req?: Request) {
  const filePath = normalize(join(dir, path));
  if (!filePath.startsWith(dir + '/')) return null;
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  // Built JS and CSS have a gzipped copy next to them (scripts/build.ts)
  const gzipped = Bun.file(`${filePath}.gz`);
  if (req?.headers.get('Accept-Encoding')?.includes('gzip') && (await gzipped.exists())) {
    return new Response(gzipped, {
      headers: {
        'Cache-Control': cacheControl,
        'Content-Type': file.type,
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding',
      },
    });
  }
  return new Response(file, { headers: { 'Cache-Control': cacheControl } });
}

/* ---------------------------------- pages --------------------------------- */

let manifest: Promise<Manifest> = Bun.file(join(DIST_DIR, 'manifest.json'))
  .json()
  .catch(() => buildClient());

function getLocale(req: Request): Lang {
  const negotiator = new Negotiator({ headers: Object.fromEntries(req.headers) });
  return (negotiator.language(LANGS) as Lang | undefined) ?? 'en';
}

async function loadPage(lang: Lang, rest: string[], searchParams: URLSearchParams) {
  if (!rest.length) {
    return { page: { name: 'home', lang, gallery: await getGallery(pexels) } satisfies Page };
  }
  const [segment, roomCode, imageId, ...extra] = rest;
  if (segment !== 'room' || !roomCode || !ROOM_CODE.test(roomCode) || extra.length) {
    return { page: { name: 'notFound', lang } satisfies Page, status: 404 };
  }
  if (!imageId) {
    // An invite link: open whatever the room is puzzling on right now
    const puzzle = rooms.get(roomCode)?.puzzle ?? store.getPuzzle(roomCode);
    return { redirect: puzzle ? `/${lang}/room/${roomCode}/${puzzle.imageData.id}` : `/${lang}` };
  }
  const id = decodeURIComponent(imageId);
  // If Pexels can't answer (rate limit), the room knows its own image
  const roomImage = (rooms.get(roomCode)?.puzzle ?? store.getPuzzle(roomCode))?.imageData;
  const image = (await pexels.getImage(id)) ?? (String(roomImage?.id) === id ? roomImage : null);
  if (!image) return { redirect: `/${lang}` };
  const size = searchParams.get('size') as Size;
  return {
    page: {
      name: 'room',
      lang,
      roomCode,
      image,
      size: sizes.includes(size) ? size : 's',
    } satisfies Page,
  };
}

async function servePage(req: Request, pathname: string, searchParams: URLSearchParams) {
  const [lang, ...rest] = pathname.split('/').filter(Boolean);
  if (!LANGS.includes(lang as Lang)) {
    return redirect(`/${getLocale(req)}${pathname === '/' ? '' : pathname}`);
  }

  const result = await loadPage(lang as Lang, rest, searchParams);
  if (result.redirect) return redirect(result.redirect);

  if (DEV) manifest = buildClient(true);
  const html = renderPage(result.page!, pathname, await manifest);
  const gzip = req.headers.get('Accept-Encoding')?.includes('gzip');
  return new Response(gzip ? Bun.gzipSync(html) : html, {
    status: result.status ?? 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...(gzip && { 'Content-Encoding': 'gzip' }),
    },
  });
}

const server = Bun.serve<WSData>({
  port: PORT,
  hostname: '0.0.0.0',
  maxRequestBodySize: MAX_IMAGE_BYTES,

  async fetch(req, server) {
    const { pathname, searchParams } = new URL(req.url);

    if (pathname === '/api/ws') {
      const roomCode = searchParams.get('room') ?? '';
      if (!ROOM_CODE.test(roomCode)) return new Response('Bad room code', { status: 400 });
      const data: WSData = { roomCode, id: crypto.randomUUID(), color: '', pieceIds: [] };
      if (server.upgrade(req, { data })) return;
      return new Response('Upgrade failed', { status: 400 });
    }

    if (pathname === '/api/health') return new Response('ok');

    const roomMatch = pathname.match(/^\/api\/rooms\/([^/]+)$/);
    if (roomMatch && req.method === 'GET') {
      const code = roomMatch[1];
      if (!ROOM_CODE.test(code)) return json({ error: 'Bad room code' }, 400);
      const puzzle = rooms.get(code)?.puzzle ?? store.getPuzzle(code);
      return puzzle ? json({ puzzle }) : json({ error: 'Not found' }, 404);
    }

    if (pathname === '/api/images' && req.method === 'POST') return uploadImage(req);

    const imageMatch = pathname.match(/^\/api\/images\/([^/]+\.jpg)$/);
    if (imageMatch && req.method === 'GET') {
      const immutable = 'public, max-age=31536000, immutable';
      return (await serveFile(IMAGES_DIR, imageMatch[1], immutable)) ?? notFound();
    }

    if (pathname === '/api/gallery') return json(await getGallery(pexels));

    if (pathname.startsWith('/api/')) return notFound();

    if (pathname.startsWith('/assets/')) {
      const immutable = 'public, max-age=31536000, immutable';
      const path = pathname.slice('/assets/'.length);
      return (await serveFile(DIST_DIR, path, immutable, req)) ?? notFound();
    }

    const publicFile = await serveFile(PUBLIC_DIR, pathname, 'public, max-age=86400');
    if (publicFile) return publicFile;

    return servePage(req, pathname, searchParams);
  },

  error(error) {
    console.error(error);
    return new Response('Something went wrong', { status: 500 });
  },

  websocket: {
    maxPayloadLength: 4 * 1024 * 1024,

    open(ws) {
      const room = getRoom(ws.data.roomCode);
      ws.data.color = pickColor(room);
      room.clients.add(ws);
      ws.subscribe(room.code);
      send(ws, {
        type: 'welcome',
        id: ws.data.id,
        color: ws.data.color,
        peers: peers(room),
        room: snapshot(room),
      });
      publish(ws, { type: 'peers', peers: peers(room) });
    },

    message(ws, raw) {
      let message: ClientMessage;
      try {
        message = JSON.parse(String(raw));
      } catch {
        return;
      }
      try {
        handleMessage(ws, message);
      } catch (error) {
        console.error('Failed to handle message:', error);
      }
    },

    close(ws) {
      const room = rooms.get(ws.data.roomCode);
      if (!room) return;
      room.clients.delete(ws);
      // The socket is already unsubscribed, so these go to everyone left
      const message = (msg: ServerMessage) => server.publish(room.code, JSON.stringify(msg));
      if (ws.data.pieceIds.length) message({ type: 'select', from: ws.data.id, pieceIds: [] });
      message({ type: 'peers', peers: peers(room) });
    },
  },
});

setInterval(flush, FLUSH_MS);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    flush();
    store.close();
    process.exit(0);
  });
}

// Warm the Pexels cache, so the first visitor after a deploy doesn't wait for it
getGallery(pexels).catch(() => {});

console.log(`Puzzelin on http://localhost:${server.port}, data in ${DATA_DIR}`);
