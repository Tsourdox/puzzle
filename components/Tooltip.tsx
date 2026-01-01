import { PointerEvent, ReactNode, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700/80',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-zinc-700/80',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-px border-4 border-transparent border-l-zinc-700/80',
    right:
      'right-full top-1/2 -translate-y-1/2 -mr-px border-4 border-transparent border-r-zinc-700/80',
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setIsVisible(true);
    }
  };

  const handlePointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setIsVisible(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} px-3 py-1.5 bg-zinc-700/80 text-zinc-100 text-sm rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-lg`}
        >
          {content}
          <div className={`absolute ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}
