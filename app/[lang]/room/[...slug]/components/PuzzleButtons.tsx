'use client';

import Button from '@/components/Button';
import { ArrowPathIcon, RectangleGroupIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function PuzzleButtons() {
  const [isPieceSelected, setIsPieceSelected] = useState(false);

  return null;

  return (
    <>
      <Button
        className="p-2"
        variant="secondary"
        icon={<PlusCircleIcon width={30} height={30} />}
        onClick={() => setIsPieceSelected((prev) => !prev)}
      />
      <Button
        className="p-2"
        variant="secondary"
        icon={<MinusCircleIcon width={30} height={30} />}
      />
      {isPieceSelected && (
        <>
          <Button
            className="p-2"
            variant="secondary"
            icon={<ArrowPathIcon width={30} height={30} />}
          />
          <Button
            className="p-2 -scale-x-100 active:-scale-x-95"
            variant="secondary"
            icon={<ArrowPathIcon width={30} height={30} />}
          />
          <Button
            className="p-[10px]"
            variant="secondary"
            icon={<Square3Stack3DIcon width={26} height={26} />}
          />
          <Button
            className="p-[10px]"
            variant="secondary"
            icon={<RectangleGroupIcon width={26} height={26} />}
          />
        </>
      )}
    </>
  );
}
