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
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  useEffect(() => {
    const scrollDiv = scrollRef.current;
    if (!scrollDiv) return;

    const handleScroll = () => {
      const scrolledFromLeft = scrollDiv.scrollLeft > 0 && scrollLeft === 0;
      const scrolledToLeft = scrollDiv.scrollLeft === 0 && scrollLeft > 0;
      const scrolledFromRight = scrollDiv.scrollLeft >= scrollWidth && scrollLeft < scrollWidth;
      const scrolledToRight = scrollDiv.scrollLeft < scrollWidth && scrollLeft >= scrollWidth;
      if (scrolledFromLeft || scrolledToLeft || scrolledFromRight || scrolledToRight) {
        setScrollLeft(scrollDiv.scrollLeft);
      }
    };

    scrollDiv?.addEventListener('scroll', handleScroll);
    return () => scrollDiv?.removeEventListener('scroll', handleScroll);
  }, [scrollLeft, scrollWidth]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 768;
    const factor = isMobile ? 0.5 : 0.7;
    const amount = scrollRef.current.clientWidth * (direction === 'right' ? factor : -factor);
    const newScrollLeft = scrollRef.current.scrollLeft + amount;
    scrollRef.current.scrollLeft = newScrollLeft;
    setScrollLeft(newScrollLeft);
  };

  return (
    <div className="relative">
      {scrollLeft > 0 && (
        <ArrowLeftCircleIcon
          onClick={() => scroll('left')}
          className="text-neutral-50 bg-purple-950/30 w-12 md:w-20 aspect-square absolute left-2 md:left-6 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full active:text-neutral-200 cursor-pointer z-20"
        />
      )}
      {scrollWidth > 0 && scrollLeft < scrollWidth && (
        <ArrowRightCircleIcon
          onClick={() => scroll('right')}
          className="text-neutral-50 bg-purple-950/30 w-12 md:w-20 aspect-square absolute right-2 md:right-6 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full active:text-neutral-200 cursor-pointer z-20"
        />
      )}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto invisibe-scroll scroll-smooth items-center"
      >
        <div className="w-0 sm:w-4 md:w-16 aspect-square flex-none" />
        {children}
        <div className="w-0 sm:w-4 md:w-16 aspect-square flex-none" />
      </div>
    </div>
  );
}
