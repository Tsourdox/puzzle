import { Lang } from '@/locales';
import { searchPexelsImages } from '@/utils/pexels';
import ImageCardNewPuzzle from './ImageCardNewPuzzle';
import ScrollBox from './ScrollBox';

interface Props {
  title: string;
  searchTerm: string;
  lang: Lang;
}

export default async function SlideshowRow({ title, searchTerm, lang }: Props) {
  const pexelImages = await searchPexelsImages(searchTerm);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-neutral-200 ml-2 sm:ml-8 md:ml-20 pl-2 font-sans">
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
