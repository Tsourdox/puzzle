'use client';
import {
  ArrowRightCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState } from 'react';
import Footer from './Footer';

export function AppBar() {
  const [isClosed, setIsOpen] = useState(false);

  return (
    <aside
      className={clsx(
        'absolute right-0 h-full transition-transform duration-500 flex flex-col justify-center p-6 text-5xl uppercase bg-neutral-950/10 text-neutral-100 backdrop-blur-lg shadow-2xl shadow-black/30',
        isClosed && 'translate-x-full',
      )}
    >
      <i
        className="absolute top-6 -left-20 backdr backdrop-blur-lg shadow-2xl shadow-black/50 rounded-full active:scale-90"
        onClick={() => setIsOpen((o) => !o)}
      >
        {isClosed ? (
          <QuestionMarkCircleIcon width={50} height={50} />
        ) : (
          <ArrowRightCircleIcon width={50} height={50} />
        )}
      </i>
      <section className="grow flex flex-col gap-6">
        <h1 className="mb-4">Puzzelin</h1>
        <h2 className="text-lg">Lorem</h2>
        <h2 className="text-lg">Ipsum</h2>
      </section>
      <Footer className="flex-col gap-1" />
    </aside>
  );
}
