import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type Props = JSX.IntrinsicElements['button'] & {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
};

export default function Button({
  icon,
  variant = 'primary',
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={twMerge(
        'backdrop-blur-lg bg-gradient-to-br uppercase from-purple-950/90 to-purple-950/60 hover:from-purple-950/70 hover:to-purple-900/90 pt-2 pb-3 px-5 rounded-3xl font-primary text-xl flex items-center gap-4 whitespace-nowrap',
        variant === 'secondary' &&
          'from-neutral-700/20 to-purple-950/20 hover:from-neutral-700/40 hover:to-purple-950/30 ',
        className,
      )}
    >
      {icon}
      <span className="flex pt-1">{children}</span>
    </button>
  );
}
