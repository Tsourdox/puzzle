import { Lang, getTranslation } from '@/language';
import type { GalleryRow } from '../pages';
import SlideshowRow from './SlideshowRow';

interface PuzzleSelectionGridProps {
  lang: Lang;
  rows: GalleryRow[];
}

export default function PuzzleSelectionGrid({ lang, rows }: PuzzleSelectionGridProps) {
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col gap-12 w-full">
      {rows.map((row) => (
        <SlideshowRow key={row.title} title={t(row.title)} images={row.images} lang={lang} />
      ))}
    </div>
  );
}
