import CuratedSlideshowRow from '@/app/[lang]/components/CuratedSlideshowRow';
import SlideshowRow from '@/app/[lang]/components/SlideshowRow';
import { Lang, getTranslation } from '@/language';
import { getSeasonalRows } from '@/utils/seasonalRows';

interface PuzzleSelectionGridProps {
  lang: Lang;
}

export default function PuzzleSelectionGrid({ lang }: PuzzleSelectionGridProps) {
  const t = getTranslation(lang);
  const seasonalRows = getSeasonalRows();

  return (
    <div className="flex flex-col gap-12 w-full">
      {/* Seasonal rows based on current date */}
      {seasonalRows.map((row) => (
        <SlideshowRow key={row.titleKey} title={t(row.titleKey as any)} searchTerm={row.searchTerm} lang={lang} />
      ))}

      {/* Curated collection */}
      <CuratedSlideshowRow title={t('Curated collection')} lang={lang} />

      {/* Permanent categories */}
      <SlideshowRow title={t('Cats')} searchTerm="cats" lang={lang} />
      <SlideshowRow title={t('Beautiful oceans')} searchTerm="ocean landscape" lang={lang} />
      <SlideshowRow title={t('Nature')} searchTerm="nature" lang={lang} />
      <SlideshowRow title={t('Animals')} searchTerm="animals" lang={lang} />
      <SlideshowRow title={t('Forests')} searchTerm="forest" lang={lang} />
      <SlideshowRow title={t('People')} searchTerm="people" lang={lang} />
      <SlideshowRow title={t('In the mountains')} searchTerm="mountains" lang={lang} />
      <SlideshowRow title={t('Greece')} searchTerm="greek" lang={lang} />
      <SlideshowRow title={t('Sport')} searchTerm="sport" lang={lang} />
      <SlideshowRow title={t('Cities')} searchTerm="city" lang={lang} />
      <SlideshowRow title={t('Babies')} searchTerm="babies" lang={lang} />
      <SlideshowRow title={t('Flowers')} searchTerm="flowers" lang={lang} />
      <SlideshowRow title={t('Cartoon')} searchTerm="cartoon" lang={lang} />
    </div>
  );
}
