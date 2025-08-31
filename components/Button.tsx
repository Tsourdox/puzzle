import { ComponentProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type Props = ComponentProps<'button'> & {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
  disabledText?: string;
};

export default function Button({
  icon,
  variant = 'primary',
  children,
  className,
  disabled,
  disabledText,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled}
      {...props}
      className={twMerge(
        'relative backdrop-blur-lg bg-gradient-to-br from-purple-950/90 to-purple-950/60 hover:from-purple-950/70 hover:to-purple-900/90 pt-2 pb-3 px-5 rounded-full text-xl flex items-center gap-4 whitespace-nowrap active:scale-95',
        variant === 'secondary' &&
          'from-zinc-700/20 to-purple-950/20 hover:from-zinc-700/40 hover:to-purple-950/30 ',
        className,
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {icon}
      {children && <span className="flex uppercase pt-1">{children}</span>}
      {disabled && disabledText && (
        <span className="absolute font-sans text-xs font-semibold text-purple-400 whitespace-nowrap right-0 bottom-0 -rotate-6">
          {disabledText}
        </span>
      )}
    </button>
  );
}
