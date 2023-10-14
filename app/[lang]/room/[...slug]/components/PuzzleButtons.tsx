'use client';

import Button from '@/components/Button';
import { useStoreState } from '@/store/StoreProvider';
import { ArrowPathIcon, RectangleGroupIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

type Props = {
  isHidden?: boolean;
};

export default function PuzzleButtons({ isHidden }: Props) {
  const { showPuzzlePieceActions } = useStoreState();

  const showPieceActionButton = !isHidden && showPuzzlePieceActions;

  return (
    <>
      <Button
        className={twMerge(
          'transition-opacity p-2 opacity-100',
          isHidden && 'opacity-0 pointer-events-none',
        )}
        variant="secondary"
        icon={<PlusCircleIcon width={30} height={30} />}
      />
      <Button
        className={twMerge(
          'transition-opacity p-2 opacity-100',
          isHidden && 'opacity-0 pointer-events-none',
        )}
        variant="secondary"
        icon={<MinusCircleIcon width={30} height={30} />}
      />

      <>
        <Button
          className={twMerge(
            'transition-opacity p-2 opacity-100',
            !showPieceActionButton && 'opacity-0 pointer-events-none',
          )}
          variant="secondary"
          icon={<ArrowPathIcon width={30} height={30} />}
        />
        <Button
          className={twMerge(
            'transition-opacity p-2 opacity-100 -scale-x-100 active:-scale-x-95',
            !showPieceActionButton && 'opacity-0 pointer-events-none',
          )}
          variant="secondary"
          icon={<ArrowPathIcon width={30} height={30} />}
        />
        <Button
          className={twMerge(
            'transition-opacity p-[10px] opacity-100',
            !showPieceActionButton && 'opacity-0 pointer-events-none',
          )}
          variant="secondary"
          icon={<Square3Stack3DIcon width={26} height={26} />}
        />
        <Button
          className={twMerge(
            'transition-opacity p-[10px] opacity-100',
            !showPieceActionButton && 'opacity-0 pointer-events-none',
          )}
          variant="secondary"
          icon={<RectangleGroupIcon width={26} height={26} />}
        />
      </>
    </>
  );
}
