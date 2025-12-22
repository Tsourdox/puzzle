import SlideshowRow from '@/app/[lang]/components/SlideshowRow';
import { Lang, getTranslation } from '@/language';

export const revalidate = 345_600; // 4 days

interface PuzzleSelectionGridProps {
  lang: Lang;
}

export default function PuzzleSelectionGrid({ lang }: PuzzleSelectionGridProps) {
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col gap-12 w-full">
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
