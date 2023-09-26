import { searchPexelsImages } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import CardContentNewPuzzle from './ImageCardNewPuzzle';
import ScrollBox from './ScrollBox';

interface Props {
  title: string;
  searchTerm: string;
  size: Size;
}

export default async function SlideshowRow({ title, searchTerm, size }: Props) {
  const pexelImages = await searchPexelsImages(searchTerm);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-neutral-200 ml-2 sm:ml-8 md:ml-20 pl-2 font-sans">
        {title}
      </h2>
      <ScrollBox>
        {pexelImages.map((image) => (
          <CardContentNewPuzzle key={image.id} image={image} size={size} />
        ))}
      </ScrollBox>
    </section>
  );
}
