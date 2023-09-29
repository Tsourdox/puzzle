import { PexelsImage } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import ImageCardContainer from './ImageCardContainer';
import SizeButtons from './SizeButtons';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  image: PexelsImage;
  size: Size;
}

export default function ImageCardtNewPuzzle({ image, size }: Props) {
  return (
    <ImageCardContainer image={image}>
      <h2 className="text-xl drop-shadow-lg">Välj storlek</h2>
      <SizeButtons />
      <StartPuzzleButton size={size} image={image}>
        Börja Pussla
      </StartPuzzleButton>
    </ImageCardContainer>
  );
}
