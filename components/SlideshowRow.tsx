import Image from 'next/image';
import Link from 'next/link';
import ScrollBox from './ScrollBox';

interface PexelsImage {
  src: {
    original: string;
    large2x: string;
    large: string;
  };
}

interface Props {
  title: string;
  searchTerm?: string;
  images?: string[];
}

const API_KEY = '563492ad6f91700001000001e9543e64cc6240f3a18b3b0d9f42629d';

export default async function SlideshowRow({
  title,
  searchTerm,
  images,
}: Props) {
  const fetchImageGroupFromAPI = async () => {
    if (!searchTerm) return [];

    const domain = 'https://api.pexels.com/';
    const path = 'v1/search';
    const page = Math.ceil(Math.random() * 5);
    const query = `?query=${searchTerm}&orientation=landscape&per_page=30&page=${page}`;
    const url = `${domain}${path}${query}`;
    const response = await fetch(url, {
      headers: { Authorization: API_KEY },
    });

    return (await response.json()).photos as PexelsImage[];
  };

  const pexelImages = await fetchImageGroupFromAPI();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl capitalize font-semibold text-neutral-200 ml-20 pl-2 font-sans">
        {title}
      </h2>
      <ScrollBox>
        {images?.map((image) => (
          <ImageLink key={image} imageSrc={image} />
        ))}
        {pexelImages.map((image) => (
          <ImageLink key={image.src.large} imageSrc={image.src.large} />
        ))}
      </ScrollBox>
    </section>
  );
}

function ImageLink({ imageSrc }: { imageSrc: string }) {
  return (
    <Link
      href={'room/' + Math.random().toString().slice(4, 9)}
      className="w-80 aspect-square flex-none"
    >
      <Image
        src={imageSrc}
        alt=""
        width={300}
        height={300}
        className="w-full h-full object-cover rounded-3xl"
      />
    </Link>
  );
}
