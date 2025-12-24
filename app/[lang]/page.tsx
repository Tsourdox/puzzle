import SocialLinks from '@/components/SocialLinks';
import { Lang, getTranslation } from '@/language';
import ActionButtons from './components/ActionButtons';
import ContinueSlideshowRow from './components/ContinueSlideshowRow';
import PuzzleSelectionGrid from './components/PuzzleSelectionGrid';

type Props = {
  params: Promise<{ lang: Lang }>;
};

export const revalidate = 86_400; // 1 days

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col py-16 gap-10">
      <header className="flex flex-col gap-4 items-center">
        <h1 className="relative">
          <span className="text-6xl text-transparent uppercase bg-clip-text bg-linear-to-l from-purple-700 to-purple-100">
            Puzzelin
          </span>
          <span className="uppercase text-2xl text-purple-300/70 absolute -top-5 right-1">
            BETA
          </span>
        </h1>
        <span className="text-2xl font-thin text-zinc-300 border-t border-zinc-800 px-4 font-sans text-center">
          {t('An online puzzle for you and your friends!')}
        </span>
      </header>

      <section className="flex gap-x-8 gap-y-4 justify-center flex-wrap">
        <ActionButtons lang={lang} />
      </section>

      <main className="flex flex-col gap-12 w-screen">
        <ContinueSlideshowRow lang={lang} />
        <PuzzleSelectionGrid lang={lang} />
      </main>

      <footer className="flex justify-center items-center gap-12">
        <SocialLinks className="flex gap-8">|</SocialLinks>
      </footer>
    </div>
  );
}
