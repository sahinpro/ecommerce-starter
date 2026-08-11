import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { getHeroContent } from '../../api/service';

export async function HeroSection() {
  const hero = await getHeroContent();

  return (
    <section className='relative h-[1200px] max-h-[85vh] w-full overflow-hidden'>
      <Image
        src={hero.image_url}
        alt={hero.title}
        fill
        priority
        className='object-cover'
        sizes='100vw'
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent' />
      <div className='absolute bottom-10 left-10 max-w-md text-white'>
        <h1 className='font-serif text-4xl leading-tight md:text-5xl'>{hero.title}</h1>
        <Link
          href={hero.href}
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'mt-6 inline-flex h-10 rounded-none bg-white px-6 text-black hover:bg-white/90'
          )}
        >
          {hero.subtitle}
        </Link>
      </div>
    </section>
  );
}
