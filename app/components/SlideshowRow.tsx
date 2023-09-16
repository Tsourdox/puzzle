import { Size } from '@/utils/sizes';
import ImageCard from './ImageCard';
import ScrollBox from './ScrollBox';

export interface PexelsImage {
  id: string;
  src: {
    large2x: string;
    large: string;
    medium: string;
  };
}

interface Props {
  title: string;
  searchTerm?: string;
  images?: string[];
  size: Size;
}

const loadImagesFromPexels = async (searchTerm?: string) => {
  const API_KEY = '563492ad6f91700001000001e9543e64cc6240f3a18b3b0d9f42629d';
  if (!searchTerm) return [];

  const domain = 'https://api.pexels.com/';
  const path = 'v1/search';
  const page = 1;
  // const page = Math.ceil(Math.random() * 5);
  const query = `?query=${searchTerm}&orientation=landscape&per_page=10&page=${page}`;
  const url = `${domain}${path}${query}`;
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  return (await response.json()).photos as PexelsImage[];
};

export default async function SlideshowRow({
  title,
  searchTerm,
  images,
  size,
}: Props) {
  const pexelImages = await loadImagesFromPexels(searchTerm);

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
