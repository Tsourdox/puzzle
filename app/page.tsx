import Button from '@/components/Button';
import Slideshows from '@/components/Slideshows';
import SocialLinks from '@/components/SocialLinks';
import { PhotoIcon, UserGroupIcon } from '@heroicons/react/20/solid';

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
        <Button
          variant="secondary"
          icon={<UserGroupIcon width={24} height={24} />}
        >
          Gå med i ett rum
        </Button>
        <Button variant="secondary" icon={<PhotoIcon width={24} height={24} />}>
          Välj en egen bild
        </Button>
      </section>

      <main>
        <Slideshows />
      </main>

      <footer className="flex justify-center items-center gap-12">
        <SocialLinks className="flex gap-8">|</SocialLinks>
      </footer>
    </div>
  );
}
