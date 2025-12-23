'use client';
import { showSettingsAtom } from '@/app/atoms';
import Button from '@/components/Button';
import { getTranslation, Lang } from '@/language';
import { Cog8ToothIcon } from '@heroicons/react/20/solid';
import { useSetAtom } from 'jotai';

interface SettingsButtonProps {
  lang: Lang;
}

export default function SettingsButton({ lang }: SettingsButtonProps) {
  const t = getTranslation(lang);
  const setShowSettings = useSetAtom(showSettingsAtom);

  return (
    <Button
      onClick={() => setShowSettings(true)}
      variant="secondary"
      icon={<Cog8ToothIcon width={24} height={24} />}
    >
      {t('Settings')}
    </Button>
  );
}
