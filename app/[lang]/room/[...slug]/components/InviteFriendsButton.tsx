'use client';
import Button from '@/components/Button';
import { getTranslation, Lang } from '@/language';
import { UserPlusIcon } from '@heroicons/react/20/solid';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface InviteFriendsButtonProps {
  roomCode: string;
  lang: Lang;
}

export default function InviteFriendsButton({ roomCode, lang }: InviteFriendsButtonProps) {
  const t = getTranslation(lang);
  const [copiedLink, setCopiedLink] = useState(false);

  const roomUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/${lang}/room/${roomCode}` : '';

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Button
      variant="secondary"
      icon={
        copiedLink ? (
          <CheckIcon width={24} height={24} className="stroke-3" />
        ) : (
          <UserPlusIcon width={24} height={24} />
        )
      }
      onClick={copyRoomLink}
    >
      {copiedLink ? t('Link copied!') : t('Invite friends')}
    </Button>
  );
}
