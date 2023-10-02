import SlideshowRow from '@/app/[lang]/components/SlideshowRow';
import SocialLinks from '@/components/SocialLinks';
import { getTranslation } from '@/locales';
import { PropsWithLangParam } from '@/utils/general';
import ActionButtons from './components/ActionButtons';
import ContinueSlideshowRow from './components/ContinueSlideshowRow';

export default function HomePage({ params: { lang } }: PropsWithLangParam) {
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col py-16 gap-12 text-neutral-100 bg-gradient-to-bl from-[#210034] via-20% via-neutral-950 to-100% to-[#110024]">
      <header className="flex flex-col gap-4 items-center">
        <h1 className="relative">
          <span className="text-6xl text-transparent uppercase bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
            Puzzelin
          </span>
          <span className="uppercase text-2xl text-purple-300/70 absolute -top-5 right-1">
            BETA
          </span>
        </h1>
        <span className="text-2xl font-thin text-neutral-300 border-t-1 border-neutral-800 px-4 font-sans text-center">
          {t('An online puzzle for you and your friends!')}
        </span>
      </header>

      <section className="flex gap-x-8 gap-y-4 justify-center flex-wrap">
        <ActionButtons lang={lang} />
      </section>

      <main className="flex flex-col gap-12 w-screen">
        <ContinueSlideshowRow lang={lang} />
        <SlideshowRow title={t('Cats')} searchTerm="cats" lang={lang} />
        <SlideshowRow title={t('Beautiful oceans')} searchTerm="ocean landscape" lang={lang} />
        <SlideshowRow title={t('Nature')} searchTerm="nature" lang={lang} />
        <SlideshowRow title={t('Animals')} searchTerm="animals" lang={lang} />
        <SlideshowRow title={t('Forests')} searchTerm="forest" lang={lang} />
        <SlideshowRow title={t('People')} searchTerm="people" lang={lang} />
        <SlideshowRow title={t('In the mountains')} searchTerm="mountains" lang={lang} />
        <SlideshowRow title={t('Greece')} searchTerm="greek" lang={lang} />
        <SlideshowRow title={t('Sport')} searchTerm="sport" lang={lang} />
        <SlideshowRow title={t('Cities')} searchTerm="city" lang={lang} />
        <SlideshowRow title={t('Babies')} searchTerm="babies" lang={lang} />
        <SlideshowRow title={t('Flowers')} searchTerm="flowers" lang={lang} />
      </main>

      <footer className="flex justify-center items-center gap-12">
        <SocialLinks className="flex gap-8">|</SocialLinks>
      </footer>
    </div>
  );
}
