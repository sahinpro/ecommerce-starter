import Image from 'next/image';
import Link from 'next/link';

import { getStories } from '../../api/service';

export async function JournalSection() {
  const stories = await getStories();

  return (
    <section className='grid grid-cols-1 lg:grid-cols-2'>
      {stories.map((story) => (
        <article key={story.id} className='group'>
          <div className='bg-muted relative aspect-[960/1200] max-h-[75vh] overflow-hidden'>
            <Image
              src={story.image_url}
              alt={story.title}
              fill
              className='object-cover transition-transform duration-700 group-hover:scale-[1.02]'
              sizes='(max-width: 1024px) 100vw, 50vw'
            />
          </div>
          <div className='space-y-3 px-10 py-8'>
            <h2 className='font-serif text-xl'>{story.title}</h2>
            <p className='text-muted-foreground max-w-md text-sm leading-relaxed'>
              {story.excerpt}
            </p>
            <Link
              href={`/about#${story.slug}`}
              className='inline-block text-sm underline-offset-4 hover:underline'
            >
              {story.link_text}
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
