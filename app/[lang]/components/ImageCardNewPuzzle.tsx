import { Lang, getTranslation } from '@/language';
import { PexelsImage } from '@/utils/pexels';
import ImageCardContainer from './ImageCardContainer';
import SizeButtons from './SizeButtons';
import StartPuzzleButton from './StartPuzzleButton';

interface Props {
  image: PexelsImage;
  lang: Lang;
}

export default function ImageCardNewPuzzle({ image, lang }: Props) {
  const t = getTranslation(lang);
  return (
    <ImageCardContainer image={image}>
      <h2 className="text-xl drop-shadow-lg">{t('Select size')}</h2>
      <SizeButtons />
      <StartPuzzleButton image={image}>{t('Begin puzzle')}</StartPuzzleButton>
    </ImageCardContainer>
  );
}
