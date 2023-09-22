'use client';
import { PexelsImage } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';

interface Props {
  size: Size;
  image: PexelsImage;
  children: React.ReactNode;
  room?: string;
}

export default function StartPuzzleButton({ size, image, children, room }: Props) {
  const router = useRouter();
  const roomCode = room || Math.random().toString().slice(4, 8);

  const startPuzzle = () => {
    router.push(`/room/${roomCode}/${image.id}?size=${size}`);
  };

  return (
    <Button className="text-sm md:text-base" onClick={startPuzzle}>
      {children}
    </Button>
  );
}
