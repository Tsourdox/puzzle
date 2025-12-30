'use client';
import { sidebarOpenAtom, showPuzzleSelectionAtom } from '@/app/atoms';
import Button from '@/components/Button';
import { getTranslation, Lang } from '@/language';
import { PuzzlePieceIcon } from '@heroicons/react/20/solid';
import { useSetAtom } from 'jotai';

interface NewPuzzleButtonProps {
  lang: Lang;
}

export default function NewPuzzleButton({ lang }: NewPuzzleButtonProps) {
  const t = getTranslation(lang);
  const setShowPuzzleSelection = useSetAtom(showPuzzleSelectionAtom);
  const setSidebarOpen = useSetAtom(sidebarOpenAtom);

  const handleClick = () => {
    setShowPuzzleSelection(true);
    setSidebarOpen(false);
  };

  return (
    <Button variant="secondary" icon={<PuzzlePieceIcon width={24} height={24} />} onClick={handleClick}>
      {t('New puzzle')}
    </Button>
  );
}
