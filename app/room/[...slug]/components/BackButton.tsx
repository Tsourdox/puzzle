'use client';
import Button, { Props as ButtonProps } from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function BackButton({ children, ...props }: ButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <Button {...props} onClick={goBack}>
      {children}
    </Button>
  );
}
