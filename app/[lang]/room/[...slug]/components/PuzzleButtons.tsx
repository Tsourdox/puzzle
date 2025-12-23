'use client';

import { showPuzzlePieceActionsAtom } from '@/app/atoms';
import Button from '@/components/Button';
import {
  ArrowPathIcon,
  RectangleGroupIcon,
  Square3Stack3DIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useAtomValue } from 'jotai';

interface Props {
  isHidden: boolean;
}

export default function PuzzleButtons({ isHidden }: Props) {
  const showPuzzlePieceActions = useAtomValue(showPuzzlePieceActionsAtom);

  if (isHidden) return null;

  return (
    <>
      <Button
        className="transition-opacity p-2 opacity-100"
        aria-label="Zoom in"
        variant="secondary"
        icon={<PlusCircleIcon width={30} height={30} />}
      />
      <Button
        className="transition-opacity p-2 opacity-100"
        aria-label="Zoom out"
        variant="secondary"
        icon={<MinusCircleIcon width={30} height={30} />}
      />

      {showPuzzlePieceActions && (
        <>
          <Button
            className="transition-opacity p-2 opacity-100"
            aria-label="Rotate selected pieces counter clockwise"
            variant="secondary"
            icon={<ArrowPathIcon width={30} height={30} />}
          />
          <Button
            className="transition-opacity p-2 opacity-100 -scale-x-100 active:-scale-x-95"
            aria-label="Rotate selected pieces clockwise"
            variant="secondary"
            icon={<ArrowPathIcon width={30} height={30} />}
          />
          <Button
            className="transition-opacity p-2.5 opacity-100"
            aria-label="Stack all selected pieces"
            variant="secondary"
            icon={<Square3Stack3DIcon width={26} height={26} />}
          />
          <Button
            className="transition-opacity p-2.5 opacity-100"
            aria-label="Explode all selected pieces"
            variant="secondary"
            icon={<RectangleGroupIcon width={26} height={26} />}
          />
          <Button
            className="transition-opacity p-2.5 opacity-100"
            aria-label="Deselect pieces"
            variant="secondary"
            icon={<XMarkIcon width={26} height={26} />}
          />
        </>
      )}
    </>
  );
}
