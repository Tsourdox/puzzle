'use client';
import RoomCodeForm from '@/app/[lang]/components/RoomCodeForm';
import Button from '@/components/Button';
import { getTranslation } from '@/language';
import { PropsWithLang } from '@/utils/general';
import { UserGroupIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

export default function JoinRoomButton({ lang }: PropsWithLang) {
  const t = getTranslation(lang);
  const [showRoomCodeForm, setShowRoomCodeForm] = useState(false);

  if (showRoomCodeForm) {
    return <RoomCodeForm lang={lang} onCancel={() => setShowRoomCodeForm(false)} />;
  }

  return (
    <Button
      variant="secondary"
      icon={<UserGroupIcon width={24} height={24} />}
      onClick={() => setShowRoomCodeForm(true)}
    >
      {t('Join a room')}
    </Button>
  );
}
