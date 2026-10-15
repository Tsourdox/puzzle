import { Lang } from '@/language';
import { PexelsImage } from '@/utils/pexelsImage';
import ImageCardNewPuzzle from './ImageCardNewPuzzle';
import ScrollBox from './ScrollBox';

interface Props {
  title: string;
  images: PexelsImage[];
  lang: Lang;
}

export default function SlideshowRow({ title, images, lang }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-zinc-200 ml-2 sm:ml-8 md:ml-20 pl-2 font-sans">
        {title}
      </h2>
      <ScrollBox>
        {images.map((image) => (
          <ImageCardNewPuzzle key={image.id} image={image} lang={lang} />
        ))}
      </ScrollBox>
    </section>
  );
}
