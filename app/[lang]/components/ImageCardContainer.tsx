import { PexelsImage } from '@/utils/pexels';
import Image from 'next/image';
import { ReactNode } from 'react';

interface Props {
  image: PexelsImage;
  children: ReactNode;
}

export default function ImageCardContainer({ image, children }: Props) {
  return (
    <div className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden">
      <Image
        src={image.src.medium}
        alt=""
        width={300}
        height={300}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />

      <div className="absolute invisible group-hover:visible top-0 left-0 w-full h-full backdrop-blur-sm bg-black/10 flex flex-col justify-center items-center gap-4">
        {children}
      </div>
    </div>
  );
}
