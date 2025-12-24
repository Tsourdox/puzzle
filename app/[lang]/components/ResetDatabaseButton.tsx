'use client';

import Button from '@/components/Button';
import { getTranslation, Lang } from '@/language';
import { TrashIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

interface Props {
  lang: Lang;
}

export default function ResetDatabaseButton({ lang }: Props) {
  const t = getTranslation(lang);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm(t('This will delete all saved puzzles. Are you sure?'))) {
      return;
    }

    setIsResetting(true);
    try {
      // Get all databases
      const databases = await indexedDB.databases();

      // Delete all puzzelin databases
      const deletePromises = databases
        .filter((db) => db.name?.startsWith('puzzelin_'))
        .map((db) => {
          return new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(db.name!);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        });

      await Promise.all(deletePromises);

      alert(t('Database reset successfully! Refresh the page.'));
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset database:', error);
      alert(t('Failed to reset database'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      onClick={handleReset}
      variant="secondary"
      icon={<TrashIcon width={20} height={20} />}
      disabled={isResetting}
      className="text-xs"
    >
      {isResetting ? t('Resetting') + '...' : t('Reset Database')}
    </Button>
  );
}
