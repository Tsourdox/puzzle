import { PexelsImage } from '@/utils/pexels';
import Image from 'next/image';

type Props = JSX.IntrinsicElements['div'] & {
  image: PexelsImage;
};

export default function ImageCardContainer({ image, children, ...props }: Props) {
  return (
    <div
      className="group w-44 sm:w-56 md:w-80 relative aspect-square flex-none rounded-3xl overflow-hidden"
      {...props}
    >
      <Image
        src={image.src.medium}
        alt={image.alt}
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
