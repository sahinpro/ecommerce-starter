import Image from 'next/image';
import Link from 'next/link';

import { getStories } from '../../api/service';

export async function JournalSection() {
  const stories = await getStories();

  return (
    /* Figma 1:148 — 1379px section; images 960×1200; copy below */
    <section className='grid grid-cols-1 lg:grid-cols-2' data-node-id='1:148'>
      {stories.map((story) => (
        <article key={story.id} className='group pb-10 lg:pb-[59px]'>
          <div className='bg-muted relative aspect-[960/1200] overflow-hidden lg:h-[1200px] lg:aspect-auto'>
            <Image
              src={story.image_url}
              alt={story.title}
              fill
              className='object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]'
              sizes='(max-width: 1024px) 100vw, 50vw'
            />
          </div>
          {/* Figma: title center ~27.5px below image; body ~70px; CTA ~118px */}
          <div className='px-10 pt-[20px]'>
            <h2 className='text-[15px] leading-[15px] font-bold tracking-[0.45px] uppercase'>
              {story.title}
            </h2>
            <p className='mt-[28px] max-w-[460px] text-[14px] leading-5 tracking-[0.28px]'>
              {story.excerpt}
            </p>
            <Link
              href={`/about#${story.slug}`}
              className='mt-[28px] inline-block border-b border-[#5d5d5d] text-[13px] leading-[13px] tracking-[0.26px]'
            >
              {story.link_text}
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
