import SlideshowRow from '@/app/[lang]/components/SlideshowRow';
import SocialLinks from '@/components/SocialLinks';
import { getTranslation } from '@/locales';
import { PropsWithLangParam } from '@/utils/general';
import ActionButtons from './components/ActionButtons';
import ContinueSlideshowRow from './components/ContinueSlideshowRow';

export default function HomePage({ params }: PropsWithLangParam) {
  const t = getTranslation(params.lang);

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
          {t('siteDescription')}
        </span>
      </header>

      <section className="flex gap-x-8 gap-y-4 justify-center flex-wrap">
        <ActionButtons t={t} />
      </section>

      <main className="flex flex-col gap-12 w-screen">
        <ContinueSlideshowRow />
        <SlideshowRow title="Katter" searchTerm="cats" />
        <SlideshowRow title="Vackra hav" searchTerm="ocean landscape" />
        <SlideshowRow title="Naturen" searchTerm="nature" />
        <SlideshowRow title="Djur" searchTerm="animals" />
        <SlideshowRow title="I skogen" searchTerm="forest" />
        <SlideshowRow title="Människor" searchTerm="people" />
        <SlideshowRow title="Uppe på begen" searchTerm="mountains" />
        <SlideshowRow title="Grekland" searchTerm="greek" />
        <SlideshowRow title="Sport" searchTerm="sport" />
        <SlideshowRow title="Städer" searchTerm="city" />
        <SlideshowRow title="Bebisar" searchTerm="babies" />
        <SlideshowRow title="Blommor" searchTerm="flowers" />
      </main>

      <footer className="flex justify-center items-center gap-12">
        <SocialLinks className="flex gap-8">|</SocialLinks>
      </footer>
    </div>
  );
}
