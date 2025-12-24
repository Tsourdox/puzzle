import { Lang } from '@/language';
import { getCuratedPexelsImages } from '@/utils/pexels';
import ImageCardNewPuzzle from './ImageCardNewPuzzle';
import ScrollBox from './ScrollBox';

interface Props {
  title: string;
  lang: Lang;
}

export default async function CuratedSlideshowRow({ title, lang }: Props) {
  const pexelImages = await getCuratedPexelsImages();

  // Don't render if no images were fetched
  if (pexelImages.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-zinc-200 ml-2 sm:ml-8 md:ml-20 pl-2 font-sans">
        {title}
      </h2>
      <ScrollBox>
        {pexelImages.map((image) => (
          <ImageCardNewPuzzle key={image.id} image={image} lang={lang} />
        ))}
      </ScrollBox>
    </section>
  );
}
