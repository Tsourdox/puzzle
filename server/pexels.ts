import type { PexelsImage } from '@/utils/pexelsImage';
import type Store from './store';

const API_KEY = process.env.PEXELS_API_KEY ?? '';
const DAY_MS = 86_400_000;
/** After hitting their rate limit, don't ask again for a while (cached answers still work) */
const RATE_LIMIT_PAUSE_MS = 10 * 60_000;
let pausedUntil = 0;
class PausedError extends Error {}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  src: PexelsImage['src'];
}

// Pexels answers with a lot more than we use; this is what goes into every page
const toImage = (photo: PexelsPhoto) =>
  ({
    id: photo.id,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    author: photo.photographer,
    src: { large2x: photo.src.large2x, large: photo.src.large, medium: photo.src.medium },
  }) as unknown as PexelsImage;

/** They also refuse bursts, so only a few requests are in flight at once */
const MAX_CONCURRENT = 4;
let inFlight = 0;
const waiting: Array<() => void> = [];

async function pexels<T>(path: string): Promise<T> {
  if (inFlight >= MAX_CONCURRENT) await new Promise<void>((resolve) => waiting.push(resolve));
  inFlight++;
  try {
    if (Date.now() < pausedUntil) throw new PausedError();
    const response = await fetch(`https://api.pexels.com/v1/${path}`, {
      headers: { Authorization: API_KEY },
    });
    if (response.status === 429) {
      pausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS;
      console.error('Pexels rate limit hit, pausing requests for 10 minutes');
      throw new PausedError();
    }
    if (!response.ok) throw new Error(`Pexels ${path}: ${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  } finally {
    inFlight--;
    waiting.shift()?.();
  }
}

const logError = (error: unknown) => {
  if (!(error instanceof PausedError))
    console.error(error instanceof Error ? error.message : error);
};

/**
 * Pexels lookups, cached in SQLite so restarts don't hit their rate limit (200/hour).
 * Expired entries are served while they refresh in the background.
 */
export default class Pexels {
  private refreshing = new Map<string, Promise<unknown>>();

  constructor(private store: Store) {}

  private async cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
    const hit = this.store.getCache<T>(key);
    if (hit && hit.expires > Date.now()) return hit.value;

    let refresh = this.refreshing.get(key) as Promise<T> | undefined;
    if (!refresh) {
      refresh = load()
        .then((value) => {
          // Empty answers are usually failures; try again next time
          if (!Array.isArray(value) || value.length) this.store.setCache(key, value, ttl);
          return value;
        })
        .finally(() => this.refreshing.delete(key));
      this.refreshing.set(key, refresh);
    }

    if (hit) {
      refresh.catch(logError);
      return hit.value;
    }
    return refresh;
  }

  public async getImage(id: string): Promise<PexelsImage | null> {
    // Uploaded images live in our own image store, always as JPEG
    if (id.startsWith('custom_')) {
      const src = `/api/images/${id}.jpg`;
      return {
        id,
        width: 1000,
        height: 1000,
        alt: 'Custom uploaded image',
        author: 'You',
        src: { large2x: src, large: src, medium: src },
      };
    }
    if (!/^\d{1,20}$/.test(id)) return null;
    try {
      return await this.cached(`photo:${id}`, 30 * DAY_MS, async () =>
        toImage(await pexels<PexelsPhoto>(`photos/${id}`)),
      );
    } catch (error) {
      logError(error);
      return null;
    }
  }

  public async curated(): Promise<PexelsImage[]> {
    try {
      return await this.cached('curated', DAY_MS, async () => {
        const result = await pexels<{ photos: PexelsPhoto[] }>('curated?per_page=30&page=1');
        return result.photos.map(toImage);
      });
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async search(searchTerm: string): Promise<PexelsImage[]> {
    try {
      return await this.cached(`search:${searchTerm}`, DAY_MS, () => this.fetchSearch(searchTerm));
    } catch (error) {
      logError(error);
      return [];
    }
  }

  private async fetchSearch(searchTerm: string) {
    // Two big pages, taking every few images, to avoid near-duplicates. Their rate limit is
    // 200 requests an hour, and a cold cache asks for every row at once.
    const perPage = 80;
    const totalPages = 2;
    const spacing = 5;
    const query = encodeURIComponent(searchTerm);

    const pages = await Promise.all(
      Array.from({ length: totalPages }, (_, i) =>
        pexels<{ photos: PexelsPhoto[] }>(
          `search?query=${query}&orientation=landscape&per_page=${perPage}&page=${i + 1}`,
        ),
      ),
    );

    const images = new Map<number, PexelsImage>();
    for (const page of pages) {
      page.photos
        .filter((_, index) => index % spacing === 0)
        .forEach((photo) => images.set(photo.id, toImage(photo)));
    }
    return [...images.values()];
  }
}
