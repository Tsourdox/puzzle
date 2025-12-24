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

  /**
   * Resizes and compresses an image to reduce file size
   * - Max dimension: 1500px (maintains aspect ratio)
   * - Output format: JPEG with 85% quality
   * - Reduces large iPhone photos from 1-3MB to ~200-400KB
   */
  const resizeImage = (
    file: File,
    maxSize: number = 1500,
  ): Promise<{ blob: Blob; mimeType: string; extension: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Always convert to JPEG for best compression and compatibility
          const mimeType = 'image/jpeg';
          const extension = 'jpg';
          const quality = 0.85;

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, mimeType, extension });
              } else {
                reject(new Error('Failed to create image blob'));
              }
            },
            mimeType,
            quality,
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);
    try {
      // Resize and compress the image
      const { blob, mimeType, extension } = await resizeImage(file);

      // Generate unique ID for this custom image
      const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const filePath = `${customId}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('puzzle-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: mimeType,
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
