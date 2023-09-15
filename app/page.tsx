import SlideshowRow from '@/components/SlideshowRow';
import SocialLinks from '@/components/SocialLinks';
import ActionButtons from './components/ActionButtons';

export default function HomePage() {
  return (
    <div className="flex flex-col py-16 gap-16 text-neutral-100 bg-gradient-to-bl from-[#210034] via-20% via-neutral-950 to-100% to-[#110024]">
      <header className="flex flex-col gap-4 items-center">
        <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-100">
          PUZZELIN
        </h1>
        <span className="text-2xl font-thin text-neutral-300 border-t-1 border-neutral-800 px-4 font-sans">
          Ett online pussel för dig och dina vänner!
        </span>
      </header>

      <section className="flex gap-8 justify-center">
        <ActionButtons />
      </section>

      <main className="flex flex-col gap-12 w-screen">
        <SlideshowRow
          title="Fortsätt pussla"
          images={['/images/bear.jpg', '/images/rocket.jpg']}
        />
        <SlideshowRow title="Katter" searchTerm="cats" />
        <SlideshowRow title="Vackra hav" searchTerm="ocean landscape" />
        <SlideshowRow title="En naturupplevelse" searchTerm="nature" />
        <SlideshowRow title="Alla sortes djur" searchTerm="animals" />
        <SlideshowRow title="I skogen" searchTerm="forest" />
        <SlideshowRow title="Människor" searchTerm="people" />
        <SlideshowRow title="Uppe på begen" searchTerm="mountains" />
        <SlideshowRow title="Välkommen till Grekland" searchTerm="greek" />
        <SlideshowRow title="Sport" searchTerm="sport" />
        <SlideshowRow title="Städer" searchTerm="city" />
      </main>

      <footer className="flex justify-center items-center gap-12">
        <SocialLinks className="flex gap-8">|</SocialLinks>
      </footer>
    </div>
  );
}
