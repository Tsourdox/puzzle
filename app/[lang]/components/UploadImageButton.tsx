'use client';
import Button from '@/components/Button';
import { getTranslation } from '@/language';
import { PropsWithLang } from '@/utils/general';
import { supabase } from '@/utils/supabase';
import { PhotoIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function UploadImageButton({ lang }: PropsWithLang) {
  const t = getTranslation(lang);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);
    try {
      // Generate unique ID for this custom image
      const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileExt = file.name.split('.').pop();
      const filePath = `${customId}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('puzzle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Navigate to puzzle with custom image ID
      router.push(`/${lang}/room/${Math.random().toString().slice(4, 8)}/${customId}`);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        variant="secondary"
        icon={<PhotoIcon width={24} height={24} />}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : t('Upload image')}
      </Button>
    </>
  );
}
