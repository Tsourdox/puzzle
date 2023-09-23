'use client';

import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

export default function ScrollBox({ children }: PropsWithChildren) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calcScrollWidth = () => {
      if (!scrollRef.current) return 0;
      const { scrollWidth, clientWidth } = scrollRef.current;
      return scrollWidth - clientWidth;
    };

    setScrollWidth(calcScrollWidth);
    const handleResize = () => setScrollWidth(calcScrollWidth);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * (direction === 'right' ? 0.6 : -0.6);
    const newScrollLeft = scrollRef.current.scrollLeft + amount;
    scrollRef.current.scrollLeft = newScrollLeft;
    setScrollLeft(newScrollLeft);
  };

  useEffect(() => {
    const handleScroll = () => {};

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      {scrollLeft > 0 && (
        <ArrowLeftCircleIcon
          onClick={() => scroll('left')}
          className="text-neutral-50 bg-purple-950/20 w-20 h-20 absolute left-6 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full active:text-neutral-200 cursor-pointer z-20"
        />
      )}
      {scrollWidth > 0 && scrollLeft <= scrollWidth && (
        <ArrowRightCircleIcon
          onClick={() => scroll('right')}
          className="text-neutral-50 bg-purple-950/20 w-20 h-20 absolute right-6 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full active:text-neutral-200 cursor-pointer z-20"
        />
      )}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto invisibe-scroll scroll-smooth items-center"
      >
        <div className="w-4 md:w-16 aspect-square flex-none" />
        {children}
        <div className="w-4 md:w-16 aspect-square flex-none" />
      </div>
    </div>
  );
}
