'use client';
import { sidebarOpenAtom, sizeAtom } from '@/app/atoms';
import Button from '@/components/Button';
import { getTranslation } from '@/language';
import { PropsWithLang } from '@/utils/general';
import { sizes } from '@/utils/sizes';
import { supabase } from '@/utils/supabase';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useAtom, useSetAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

export default function UploadImageButton({ lang }: PropsWithLang) {
  const t = getTranslation(lang);
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useAtom(sizeAtom);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [isWaitingForUpload, setIsWaitingForUpload] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const setSidebarOpen = useSetAtom(sidebarOpenAtom);

  const isInRoom = pathname?.includes('/room/');
  const currentRoomCode = isInRoom ? pathname?.split('/room/')[1]?.split('/')[0] : null;
  const roomCode = currentRoomCode || Math.random().toString().slice(4, 8);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    setShowSizeSelector(true);

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

      // Store the uploaded image ID
      setUploadedImageId(customId);
      setIsUploading(false);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
      setIsUploading(false);
      setShowSizeSelector(false);
    }
  };

  const handleUploadClick = () => {
    setSidebarOpen(false);
    fileInputRef.current?.click();
  };

  const handleStartPuzzle = () => {
    if (uploadedImageId) {
      // Upload already complete, navigate immediately
      setShowSizeSelector(false);
      router.push(`/${lang}/room/${roomCode}/${uploadedImageId}`);
    } else if (isUploading) {
      // Still uploading, show loading state
      setIsWaitingForUpload(true);
    }
  };

  // Auto-navigate when upload completes if user is waiting
  useEffect(() => {
    if (isWaitingForUpload && uploadedImageId) {
      setShowSizeSelector(false);
      router.push(`/${lang}/room/${roomCode}/${uploadedImageId}`);
    }
  }, [isWaitingForUpload, uploadedImageId, lang, router, roomCode]);

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
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : t('Upload image')}
      </Button>

      {isMounted &&
        showSizeSelector &&
        createPortal(
          <div
            className="fixed inset-0 z-100 bg-zinc-950/95 flex items-center justify-center p-4"
            onClick={() => setShowSizeSelector(false)}
          >
            <div
              className="bg-zinc-800/90 rounded-lg p-6 md:p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-100">{t('Select size')}</h2>
                <button
                  onClick={() => setShowSizeSelector(false)}
                  className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <XMarkIcon width={24} height={24} className="text-zinc-300" />
                </button>
              </div>

              <div className="flex gap-2 md:gap-3 justify-between mb-6">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={twMerge(
                      'rounded-full uppercase px-4 py-2 md:px-5 md:py-3 text-base md:text-lg font-semibold cursor-pointer bg-zinc-500/20 hover:bg-purple-800/40 active:bg-purple-900/50 transition-colors',
                      size === selectedSize && 'bg-purple-800/60',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <Button onClick={handleStartPuzzle} className="w-full justify-center">
                {isWaitingForUpload ? t('Loading') + '...' : t('Begin puzzle')}
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
