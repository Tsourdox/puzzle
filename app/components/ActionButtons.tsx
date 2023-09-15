'use client';
import Button from '@/components/Button';
import RoomCodeForm from '@/components/RoomCodeForm';
import { PhotoIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

export default function ActionButtons() {
  const [showRoomCodeForm, setShowRoomCodeForm] = useState(false);

  if (showRoomCodeForm) {
    return <RoomCodeForm onCancel={() => setShowRoomCodeForm(false)} />;
  }
  return (
    <>
      <Button
        variant="secondary"
        icon={<UserGroupIcon width={24} height={24} />}
        onClick={() => setShowRoomCodeForm(true)}
      >
        Gå med i ett rum
      </Button>
      <Button variant="secondary" icon={<PhotoIcon width={24} height={24} />}>
        Välj en egen bild
      </Button>
    </>
  );
}
