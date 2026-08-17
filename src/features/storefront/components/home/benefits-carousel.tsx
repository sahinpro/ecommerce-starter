'use client';

import Image from 'next/image';
import { useRef, useState, type UIEvent } from 'react';

import { cn } from '@/lib/utils';

import type { Benefit } from '../../api/types';

type BenefitsCarouselProps = {
  benefits: Benefit[];
};

export function BenefitsCarousel({ benefits }: BenefitsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const next = Math.min(Math.round(el.scrollLeft / el.clientWidth), benefits.length - 1);
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
    <div className='relative'>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className='scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:overscroll-auto'
      >
        {benefits.map((benefit) => (
          <BenefitCard key={benefit.id} benefit={benefit} />
        ))}
      </div>

      {benefits.length > 1 ? (
        <div className='absolute right-5 bottom-11.5 z-20 flex gap-1.5 md:hidden'>
          {benefits.map((benefit, index) => (
            <button
              key={benefit.id}
              type='button'
              onClick={() => goTo(index)}
              aria-label={`Show ${benefit.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={cn(
                'size-1.5 rounded-full transition-colors',
                index === activeIndex ? 'bg-white' : 'bg-white/40'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <div className='relative h-[70vh] w-full min-w-full shrink-0 snap-start overflow-hidden md:h-[853.33px] md:min-w-0 md:snap-align-none'>
      <Image
        src={benefit.image_url}
        alt={benefit.title}
        fill
        className='object-cover object-center'
        sizes='(max-width: 768px) 100vw, 33vw'
      />
      <div className='absolute inset-0 bg-black/10' />
      <p className='absolute inset-x-[23%] top-1/2 -translate-y-1/2 text-center font-[Georgia,Times_New_Roman,serif] text-[16px] leading-6 tracking-[0.44px] text-white md:text-[16.3px]'>
        {benefit.title}
      </p>
    </div>
  );
}
