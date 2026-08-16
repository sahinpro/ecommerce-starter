import Image from 'next/image';
import Link from 'next/link';

import { getStories } from '../../api/service';

export async function JournalSection() {
  const [journal, featured] = await getStories();

  if (!journal || !featured) return null;

  return (
    <section className='grid grid-cols-1 lg:grid-cols-2' data-node-id='1:148'>
      <article className='group pb-6 lg:pb-6'>
        <div className='bg-muted relative aspect-960/1200 overflow-hidden'>
          <Image
            src={journal.image_url}
            alt={journal.title}
            fill
            className='object-cover object-[72%_center] transition-transform duration-700 group-hover:scale-[1.01]'
            sizes='(max-width: 1024px) 100vw, 50vw'
          />
        </div>
        <div className='px-3 lg:px-10 pt-5'>
          <h2 className='text-[15px] leading-3.75 font-bold tracking-[0.45px] uppercase'>
            {journal.title}
          </h2>
          <p className='mt-4.25 max-w-114.5 text-[14px] leading-5 tracking-[0.28px]'>
            {journal.excerpt}
          </p>
          <Link
            href={`/about#${journal.slug}`}
            className='mt-7.25 inline-block border-b border-[#5d5d5d] text-[13px] leading-3.25 tracking-[0.26px]'
          >
            {journal.link_text}
          </Link>
        </div>
      </article>

      <article className='group pb-6'>
        <div className='bg-muted relative aspect-960/1200 overflow-hidden'>
          <Image
            src={featured.image_url}
            alt={featured.title}
            fill
            className='object-cover object-[center_8%] transition-transform duration-700 group-hover:scale-[1.01]'
            sizes='(max-width: 1024px) 100vw, 50vw'
          />
        </div>
        <div className='px-3 pt-5 lg:pr-10 lg:pl-0'>
          <h2 className='text-[15px] leading-3.75 font-bold tracking-[0.45px] uppercase'>
            {featured.title}
          </h2>
          <p className='mt-4.25 max-w-107.75 text-[13.9px] leading-5 tracking-[0.28px]'>
            {featured.excerpt}
          </p>
          <Link
            href={`/about#${featured.slug}`}
            className='mt-7.25 inline-block border-b border-[#5d5d5d] text-[13px] leading-3.25 tracking-[0.26px]'
          >
            {featured.link_text}
          </Link>
        </div>
      </article>
    </section>
  );
}
