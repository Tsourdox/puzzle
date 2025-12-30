'use client';

import { puzzleActionsAtom, settingsAtom, showPuzzlePieceActionsAtom } from '@/app/atoms';
import Button from '@/components/Button';
import Tooltip from '@/components/Tooltip';
import { getTranslation, Lang } from '@/language';
import {
  ArrowPathIcon,
  LockOpenIcon,
  RectangleGroupIcon,
  Square3Stack3DIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useAtomValue } from 'jotai';

interface Props {
  isHidden: boolean;
  lang: Lang;
}

export default function PuzzleButtons({ isHidden, lang }: Props) {
  const t = getTranslation(lang);
  const showPuzzlePieceActions = useAtomValue(showPuzzlePieceActionsAtom);
  const actions = useAtomValue(puzzleActionsAtom);
  const settings = useAtomValue(settingsAtom);

  if (isHidden || !settings.ui.showPuzzleButtons) return null;

  return (
    <>
      <Tooltip content={t('Zoom in on the puzzle')} position="left">
        <Button
          onClick={() => actions?.zoomIn()}
          className="transition-opacity p-2 opacity-100"
          aria-label={t('Zoom in on the puzzle')}
          variant="secondary"
          icon={<PlusCircleIcon width={30} height={30} />}
        />
      </Tooltip>
      <Tooltip content={t('Zoom out on the puzzle')} position="left">
        <Button
          onClick={() => actions?.zoomOut()}
          className="transition-opacity p-2 opacity-100"
          aria-label={t('Zoom out on the puzzle')}
          variant="secondary"
          icon={<MinusCircleIcon width={30} height={30} />}
        />
      </Tooltip>

      {showPuzzlePieceActions && (
        <>
          <Tooltip content={t('Rotate selected pieces clockwise')} position="left">
            <Button
              onClick={() => actions?.rotateRight()}
              className="transition-opacity p-2 opacity-100"
              aria-label={t('Rotate selected pieces clockwise')}
              variant="secondary"
              icon={<ArrowPathIcon width={30} height={30} />}
            />
          </Tooltip>
          <Tooltip content={t('Rotate selected pieces counter-clockwise')} position="left">
            <Button
              onClick={() => actions?.rotateLeft()}
              className="transition-opacity p-2 opacity-100 -scale-x-100 active:-scale-x-95"
              aria-label={t('Rotate selected pieces counter-clockwise')}
              variant="secondary"
              icon={<ArrowPathIcon width={30} height={30} />}
            />
          </Tooltip>
          <Tooltip content={t('Stack all selected pieces')} position="left">
            <Button
              onClick={() => actions?.stackPieces()}
              className="transition-opacity p-2.5 opacity-100"
              aria-label={t('Stack all selected pieces')}
              variant="secondary"
              icon={<Square3Stack3DIcon width={26} height={26} />}
            />
          </Tooltip>
          <Tooltip content={t('Spread out selected pieces')} position="left">
            <Button
              onClick={() => actions?.explodePieces()}
              className="transition-opacity p-2.5 opacity-100"
              aria-label={t('Spread out selected pieces')}
              variant="secondary"
              icon={<RectangleGroupIcon width={26} height={26} />}
            />
          </Tooltip>
          <Tooltip content={t('Reconnect selected pieces')} position="left">
            <Button
              onClick={() => actions?.reconnectPieces()}
              className="transition-opacity p-3 opacity-100"
              aria-label={t('Reconnect selected pieces')}
              variant="secondary"
              icon={<LockOpenIcon width={24} height={24} />}
            />
          </Tooltip>
          <Tooltip content={t('Deselect all pieces')} position="left">
            <Button
              onClick={() => actions?.deselectAll()}
              className="transition-opacity p-2.5 opacity-100"
              aria-label={t('Deselect all pieces')}
              variant="secondary"
              icon={<XMarkIcon width={26} height={26} />}
            />
          </Tooltip>
        </>
      )}
    </>
  );
}
