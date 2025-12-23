'use client';
import { showPuzzleSelectionAtom } from '@/app/atoms';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { ReactNode } from 'react';

interface PuzzleSelectionModalProps {
  children: ReactNode;
}

export default function PuzzleSelectionModal({ children }: PuzzleSelectionModalProps) {
  const [isOpen, setIsOpen] = useAtom(showPuzzleSelectionAtom);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="fixed top-4 right-4 z-50 p-3 bg-zinc-800/90 hover:bg-zinc-700/90 rounded-full transition-colors"
      >
        <XMarkIcon width={24} height={24} className="text-zinc-300 stroke-3" />
      </button>

      {/* Scrollable content */}
      <div className="min-h-screen w-full py-16">{children}</div>
    </div>
  );
}
