import type { Lang, Translation } from '@/language';
import type { PexelsImage } from '@/utils/pexelsImage';
import type { Size } from '@/utils/sizes';

export interface GalleryRow {
  title: Translation;
  images: PexelsImage[];
}

/** What the server renders, and hands to the browser to hydrate the same thing */
export type Page =
  | { name: 'home'; lang: Lang; gallery: GalleryRow[] }
  | { name: 'room'; lang: Lang; roomCode: string; image: PexelsImage; size: Size }
  | { name: 'notFound'; lang: Lang };
