import { AppBar } from '@/components/AppBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Puzzelin Room',
  description: 'Active puzzle canvas in a room',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex flex-col flex-1 bg-neutral-800">{children}</main>
      <AppBar />
    </div>
  );
}
