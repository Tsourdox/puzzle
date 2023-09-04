import type { Metadata } from 'next';

const myFont = localFont({ src: './my-font.woff2' });

export const metadata: Metadata = {
  title: 'Puzzelin Room',
  description: 'Active puzzle in a room',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={myFont.className}>{children}</body>
    </html>
  );
}
