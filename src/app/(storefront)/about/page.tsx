export const metadata = {
  title: 'About | Sukoon'
};

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 lg:px-10 py-20'>
      <h1 className='font-serif text-4xl'>About Sukoon</h1>
      <p className='text-muted-foreground mt-6 text-lg leading-relaxed'>
        #1 premium cloth brand — founded in Bangladesh, loved worldwide. Sukoon crafts timeless
        wardrobe essentials with intentional design, premium fabrics, and responsible production.
      </p>
      <section id='the-journal' className='mt-16 space-y-4'>
        <h2 className='font-serif text-2xl'>The Journal</h2>
        <p className='text-muted-foreground leading-relaxed'>
          Stories of craftsmanship, styling inspiration, and the people behind every piece we make.
        </p>
      </section>
      <section id='india-in-layers' className='mt-12 space-y-4'>
        <h2 className='font-serif text-2xl'>India, In Layers That Last</h2>
        <p className='text-muted-foreground leading-relaxed'>
          On a mindful journey through Rajasthan, Zeenat packed lightly, dressed intentionally, and
          wore the kind of pieces that carry meaning.
        </p>
      </section>
    </div>
  );
}
