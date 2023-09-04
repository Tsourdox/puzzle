import SlideshowRow from './SlideshowRow';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <SlideshowRow
        title="Dina påbörjade pussel"
        images={['/images/bear.jpg', '/images/rocket.jpg']}
      />
      <SlideshowRow title="Katter" searchTerm="cats" />
      <SlideshowRow title="Vackra hav" searchTerm="ocean landscape" />
      <SlideshowRow title="En naturupplevelse" searchTerm="nature" />
      <SlideshowRow title="Alla sortes djur" searchTerm="animals" />
      <SlideshowRow title="Välkommen till Grekland" searchTerm="greek" />
      <SlideshowRow title="I skogen" searchTerm="forest" />
      <SlideshowRow title="Människor" searchTerm="people" />
      <SlideshowRow title="Uppe på begen" searchTerm="mountains" />
      <SlideshowRow title="Sport" searchTerm="sport" />
      <SlideshowRow title="Städer" searchTerm="city" />
    </div>
  );
}
