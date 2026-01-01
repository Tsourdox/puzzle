'use client';
import { toastsAtom } from '@/app/atoms';
import { useAtomValue } from 'jotai';
import Toast from './Toast';

export default function ToastContainer() {
  const toasts = useAtomValue(toastsAtom);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
