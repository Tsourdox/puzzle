'use client';
import { removeToastAtom, Toast as ToastType } from '@/app/atoms';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

interface ToastProps {
  toast: ToastType;
}

export default function Toast({ toast }: ToastProps) {
  const removeToast = useSetAtom(removeToastAtom);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const typeStyles = {
    error: 'from-red-950/90 to-red-900/60 border-red-500/50',
    success: 'from-green-950/90 to-green-900/60 border-green-500/50',
    info: 'from-purple-950/90 to-purple-900/60 border-purple-500/50',
  };

  return (
    <div
      className={`
        backdrop-blur-lg bg-linear-to-br
        ${typeStyles[toast.type || 'info']}
        border rounded-lg px-4 py-3 shadow-lg
        flex items-center gap-3
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="flex-1 text-sm">{toast.message}</div>
      <button
        onClick={handleClose}
        className="text-white/60 hover:text-white/90 transition-colors p-1"
        aria-label="Close"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
