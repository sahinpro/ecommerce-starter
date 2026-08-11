import { editorialBlock } from '../../constants/mock-data';

export function EditorialSection() {
  return (
    <section className='mx-auto max-w-4xl px-10 py-24 text-center'>
      <p className='font-serif text-2xl leading-relaxed md:text-3xl'>{editorialBlock.text}</p>
    </section>
  );
}
