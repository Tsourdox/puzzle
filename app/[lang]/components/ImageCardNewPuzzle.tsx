import { PexelsImage } from '@/utils/pexels';
import ImageCardContainer from './ImageCardContainer';
import SizeButtons from './SizeButtons';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  image: PexelsImage;
}

export default function ImageCardNewPuzzle({ image }: Props) {
  return (
    <ImageCardContainer image={image}>
      <h2 className="text-xl drop-shadow-lg">Välj storlek</h2>
      <SizeButtons />
      <StartPuzzleButton image={image}>Börja Pussla</StartPuzzleButton>
    </ImageCardContainer>
  );
}
