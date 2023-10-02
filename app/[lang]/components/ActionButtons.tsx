'use client';
import RoomCodeForm from '@/app/[lang]/components/RoomCodeForm';
import Button from '@/components/Button';
import { PropsWithTranslation } from '@/utils/general';
import { PhotoIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

export default function ActionButtons({ t }: PropsWithTranslation) {
  const [showRoomCodeForm, setShowRoomCodeForm] = useState(false);

  if (showRoomCodeForm) {
    return <RoomCodeForm onCancel={() => setShowRoomCodeForm(false)} />;
  }
  return (
    <>
      <Button
        disabled
        disabledText={t('comingSoon')}
        variant="secondary"
        icon={<UserGroupIcon width={24} height={24} />}
        onClick={() => setShowRoomCodeForm(true)}
      >
        {t('joinRoom')}
      </Button>
      <Button
        disabled
        disabledText={t('comingSoon')}
        variant="secondary"
        icon={<PhotoIcon width={24} height={24} />}
      >
        {t('chooseImage')}
      </Button>
    </>
  );
}
