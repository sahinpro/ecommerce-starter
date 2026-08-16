'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type UIEvent } from 'react';

import { cn } from '@/lib/utils';

import type { CollectionTile } from '../../api/types';

type CategoryTilesProps = {
  tiles: CollectionTile[];
};

export function CategoryTiles({ tiles }: CategoryTilesProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const next = Math.min(Math.round(el.scrollLeft / el.clientWidth), tiles.length - 1);
    setActiveIndex((current) => (current === next ? current : next));
  }

  function goTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: 'smooth'
    });
  }

  return (
    <section className='relative' data-node-id='1:91'>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className='scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:overscroll-auto'
      >
        {tiles.map((tile) => (
          <CategoryTile key={tile.id} tile={tile} />
        ))}
      </div>

      {tiles.length > 1 ? (
        <div className='absolute right-5 bottom-11.5 z-20 flex gap-1.5 md:hidden'>
          {tiles.map((tile, index) => (
            <button
              key={tile.id}
              type='button'
              onClick={() => goTo(index)}
              aria-label={`Show ${tile.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={cn(
                'size-1.5 rounded-full transition-colors',
                index === activeIndex ? 'bg-white' : 'bg-white/40'
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CategoryTile({ tile }: { tile: CollectionTile }) {
  return (
    <Link
      href={tile.href}
      className='group relative block h-[70vh] w-full min-w-full shrink-0 snap-start md:h-[853.33px] md:min-w-0 md:snap-align-none'
    >
      <Image
        src={tile.image_url}
        alt={tile.title}
        fill
        className='object-cover object-center transition-transform duration-700'
        sizes='(max-width: 768px) 100vw, 33vw'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-black/80 via-black/40 to-transparent'
      />
      <div className='absolute right-5 bottom-10.25 left-5 z-10 text-white'>
        <h2 className='font-[Georgia,Times_New_Roman,serif] text-[22.3px] leading-6 tracking-[0.3px]'>
          {tile.title}
        </h2>
        <span className='mt-0.75 inline-block border-b border-white text-[13px] leading-3.25 tracking-[0.26px]'>
          {tile.cta}
        </span>
      </div>
    </Link>
  );
}
