'use client';
import Button from '@/components/Button';
import { PuzzlePieceIcon } from '@heroicons/react/20/solid';
import { useSetAtom } from 'jotai';
import { showPuzzleSelectionAtom } from '@/app/atoms';
import { getTranslation, Lang } from '@/language';

interface NewPuzzleButtonProps {
  lang: Lang;
}

export default function NewPuzzleButton({ lang }: NewPuzzleButtonProps) {
  const t = getTranslation(lang);
  const setShowPuzzleSelection = useSetAtom(showPuzzleSelectionAtom);

  return (
    <Button
      variant="secondary"
      icon={<PuzzlePieceIcon width={24} height={24} />}
      onClick={() => setShowPuzzleSelection(true)}
    >
      {t('New puzzle')}
    </Button>
  );
}
