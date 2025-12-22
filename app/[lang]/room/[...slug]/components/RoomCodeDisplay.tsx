'use client';
import { getTranslation, Lang } from '@/language';
import { ClipboardDocumentIcon } from '@heroicons/react/20/solid';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface RoomCodeDisplayProps {
  roomCode: string;
  lang: Lang;
}

export default function RoomCodeDisplay({ roomCode, lang }: RoomCodeDisplayProps) {
  const t = getTranslation(lang);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 px-3">
      <span className="text-xl text-zinc-400">{t('Room code')}:</span>
      <span className="flex-1 text-center text-xl text-purple-300">{roomCode}</span>
      <button
        onClick={copyRoomCode}
        className="p-2 hover:bg-zinc-700/50 rounded-full transition-colors"
        title={t('Copy room code')}
      >
        {copiedCode ? (
          <CheckIcon width={20} height={20} className="text-zinc-50 stroke-3" />
        ) : (
          <ClipboardDocumentIcon width={20} height={20} className="text-zinc-400" />
        )}
      </button>
    </div>
  );
}
