import SlideshowRow from '@/app/components/SlideshowRow';
import SocialLinks from '@/components/SocialLinks';
import { SearchParams, parseEnum } from '@/utils/searchParams';
import { SizeEnum } from '@/utils/sizes';
import ActionButtons from './components/ActionButtons';

type Props = {
  searchParams: SearchParams;
};

export default function HomePage({ searchParams }: Props) {
  const s = parseEnum(searchParams.size, SizeEnum, 'xs');

  return (
    <div className="flex flex-col py-16 gap-16 text-neutral-100 bg-gradient-to-bl from-[#210034] via-20% via-neutral-950 to-100% to-[#110024]">
      <header className="flex flex-col gap-4 items-center">
        <h1 className="relative">
          <span className="text-6xl text-transparent uppercase bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
            Puzzelin
          </span>
          <span className="uppercase text-2xl text-purple-300/70 absolute -top-5 right-1">
            BETA
          </span>
        </h1>
        <span className="text-2xl font-thin text-neutral-300 border-t-1 border-neutral-800 px-4 font-sans">
          Ett online pussel för dig och dina vänner!
        </span>
      </header>

      <section className="flex gap-x-8 gap-y-4 justify-center flex-wrap">
        <ActionButtons />
      </section>

      <main className="flex flex-col gap-12 w-screen">
        <SlideshowRow
          title="Fortsätt pussla"
          images={['/images/bear.jpg', '/images/rocket.jpg']}
          size={s}
        />
        <SlideshowRow title="Katter" searchTerm="cats" size={s} />
        <SlideshowRow title="Vackra hav" searchTerm="ocean landscape" size={s} />
        <SlideshowRow title="Naturen" searchTerm="nature" size={s} />
        <SlideshowRow title="Djur" searchTerm="animals" size={s} />
        <SlideshowRow title="I skogen" searchTerm="forest" size={s} />
        <SlideshowRow title="Människor" searchTerm="people" size={s} />
        <SlideshowRow title="Uppe på begen" searchTerm="mountains" size={s} />
        <SlideshowRow title="Grekland" searchTerm="greek" size={s} />
        <SlideshowRow title="Sport" searchTerm="sport" size={s} />
        <SlideshowRow title="Städer" searchTerm="city" size={s} />
      </main>

      <footer className="flex justify-center items-center gap-12">
        <SocialLinks className="flex gap-8">|</SocialLinks>
      </footer>
    </div>
  );
}
