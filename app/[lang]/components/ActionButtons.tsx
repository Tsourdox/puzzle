'use client';
import RoomCodeForm from '@/app/[lang]/components/RoomCodeForm';
import Button from '@/components/Button';
import { getTranslation } from '@/language';
import { PropsWithLang } from '@/utils/general';
import { PhotoIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

export default function ActionButtons({ lang }: PropsWithLang) {
  const t = getTranslation(lang);
  const [showRoomCodeForm, setShowRoomCodeForm] = useState(false);

  if (showRoomCodeForm) {
    return <RoomCodeForm lang={lang} onCancel={() => setShowRoomCodeForm(false)} />;
  }
  return (
    <>
      <Button
        disabled
        disabledText={t('Coming soon')}
        variant="secondary"
        icon={<UserGroupIcon width={24} height={24} />}
        onClick={() => setShowRoomCodeForm(true)}
      >
        {t('Join a room')}
      </Button>
      <Button
        disabled
        disabledText={t('Coming soon')}
        variant="secondary"
        icon={<PhotoIcon width={24} height={24} />}
      >
        {t('Upload image')}
      </Button>
    </>
  );
}
