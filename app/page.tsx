import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Slideshows from '@/components/Slideshows';

export default function HomePage() {
  return (
    <div className="flex flex-col py-16 gap-16 text-neutral-100 bg-gradient-to-bl from-[#210034] via-20% via-neutral-950 to-100% to-[#110024]">
      <header className="flex flex-col gap-4 items-center">
        <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-100">
          PUZZELIN
        </h1>
        <span className="text-2xl font-thin text-neutral-300 border-t-1 border-neutral-800 px-4 font-sans">
          Ett online pussel för dig och dina vänner!
        </span>
      </header>

      <section className="flex gap-8 justify-center">
        <Button>Gå med i ett rum</Button>
        <Button>Välj en egen bild</Button>
      </section>

      <main>
        <Slideshows />
      </main>

      <Footer>|</Footer>
    </div>
  );
}
