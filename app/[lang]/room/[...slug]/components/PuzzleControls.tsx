'use client';

import { puzzleControlsAtom, settingsAtom, showPuzzlePieceControlsAtom } from '@/app/atoms';
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
import { useCallback, useRef } from 'react';

interface Props {
  isHidden: boolean;
  lang: Lang;
}

export default function PuzzleControls({ isHidden, lang }: Props) {
  const t = getTranslation(lang);
  const showPuzzlePieceControls = useAtomValue(showPuzzlePieceControlsAtom);
  const controls = useAtomValue(puzzleControlsAtom);
  const settings = useAtomValue(settingsAtom);
  const rotateAnimationRef = useRef<number | null>(null);
  const zoomAnimationRef = useRef<number | null>(null);

  const startContinuousRotation = useCallback(
    (direction: 'left' | 'right') => {
      if (rotateAnimationRef.current) return;

      const rotate = direction === 'left' ? controls.rotateLeft : controls.rotateRight;

      const animate = () => {
        rotate();
        rotateAnimationRef.current = requestAnimationFrame(animate);
      };

      animate();
    },
    [controls],
  );

  const stopContinuousRotation = useCallback(() => {
    if (rotateAnimationRef.current) {
      cancelAnimationFrame(rotateAnimationRef.current);
      rotateAnimationRef.current = null;
    }
  }, []);

  const startContinuousZoom = useCallback(
    (direction: 'in' | 'out') => {
      if (zoomAnimationRef.current) return;

      const zoom = direction === 'in' ? controls.zoomIn : controls.zoomOut;

      const animate = () => {
        zoom();
        zoomAnimationRef.current = requestAnimationFrame(animate);
      };

      animate();
    },
    [controls],
  );

  const stopContinuousZoom = useCallback(() => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }
  }, []);

  if (isHidden || !settings.ui.showPuzzleControls) return null;

  return (
    <>
      <Tooltip content={t('Zoom in on the puzzle')} position="left">
        <Button
          onMouseDown={() => startContinuousZoom('in')}
          onMouseUp={stopContinuousZoom}
          onMouseLeave={stopContinuousZoom}
          onTouchStart={() => startContinuousZoom('in')}
          onTouchEnd={stopContinuousZoom}
          className="transition-opacity p-2 opacity-100"
          aria-label={t('Zoom in on the puzzle')}
          variant="secondary"
          icon={<PlusCircleIcon width={30} height={30} />}
        />
      </Tooltip>
      <Tooltip content={t('Zoom out on the puzzle')} position="left">
        <Button
          onMouseDown={() => startContinuousZoom('out')}
          onMouseUp={stopContinuousZoom}
          onMouseLeave={stopContinuousZoom}
          onTouchStart={() => startContinuousZoom('out')}
          onTouchEnd={stopContinuousZoom}
          className="transition-opacity p-2 opacity-100"
          aria-label={t('Zoom out on the puzzle')}
          variant="secondary"
          icon={<MinusCircleIcon width={30} height={30} />}
        />
      </Tooltip>

      {showPuzzlePieceControls && (
        <>
          <Tooltip content={t('Rotate selected pieces clockwise')} position="left">
            <Button
              onMouseDown={() => startContinuousRotation('right')}
              onMouseUp={stopContinuousRotation}
              onMouseLeave={stopContinuousRotation}
              onTouchStart={() => startContinuousRotation('right')}
              onTouchEnd={stopContinuousRotation}
              className="transition-opacity p-2 opacity-100"
              aria-label={t('Rotate selected pieces clockwise')}
              variant="secondary"
              icon={<ArrowPathIcon width={30} height={30} />}
            />
          </Tooltip>
          <Tooltip content={t('Rotate selected pieces counter-clockwise')} position="left">
            <Button
              onMouseDown={() => startContinuousRotation('left')}
              onMouseUp={stopContinuousRotation}
              onMouseLeave={stopContinuousRotation}
              onTouchStart={() => startContinuousRotation('left')}
              onTouchEnd={stopContinuousRotation}
              className="transition-opacity p-2 opacity-100 -scale-x-100 active:-scale-x-95"
              aria-label={t('Rotate selected pieces counter-clockwise')}
              variant="secondary"
              icon={<ArrowPathIcon width={30} height={30} />}
            />
          </Tooltip>
          <Tooltip content={t('Stack all selected pieces')} position="left">
            <Button
              onClick={() => controls.stackPieces()}
              className="transition-opacity p-2.5 opacity-100"
              aria-label={t('Stack all selected pieces')}
              variant="secondary"
              icon={<Square3Stack3DIcon width={26} height={26} />}
            />
          </Tooltip>
          <Tooltip content={t('Spread out selected pieces')} position="left">
            <Button
              onClick={() => controls.explodePieces()}
              className="transition-opacity p-2.5 opacity-100"
              aria-label={t('Spread out selected pieces')}
              variant="secondary"
              icon={<RectangleGroupIcon width={26} height={26} />}
            />
          </Tooltip>
          <Tooltip content={t('Reconnect selected pieces')} position="left">
            <Button
              onClick={() => controls.reconnectPieces()}
              className="transition-opacity p-3 opacity-100"
              aria-label={t('Reconnect selected pieces')}
              variant="secondary"
              icon={<LockOpenIcon width={24} height={24} />}
            />
          </Tooltip>
          <Tooltip content={t('Deselect all pieces')} position="left">
            <Button
              onClick={() => controls.deselectAll()}
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
