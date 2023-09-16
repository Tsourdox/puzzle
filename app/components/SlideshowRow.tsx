import { searchPexelsImages } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import ImageCard from './ImageCard';
import ScrollBox from './ScrollBox';

interface Props {
  title: string;
  searchTerm?: string;
  images?: string[];
  size: Size;
}

export default async function SlideshowRow({
  title,
  searchTerm,
  images,
  size,
}: Props) {
  const pexelImages = await searchPexelsImages(searchTerm);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-neutral-200 ml-8 md:ml-20 pl-2 font-sans">
        {title}
      </h2>
      <ScrollBox>
        {images?.map((image) => (
          <ImageCard
            key={image}
            image={{
              id: Math.random().toString(),
              src: {
                large2x: image,
                large: image,
                medium: image,
              },
            }}
            canBeDeleted
            size={size}
          />
        ))}
        {pexelImages.map((image) => (
          <ImageCard key={image.id} image={image} size={size} />
        ))}
      </ScrollBox>
    </section>
  );
}
