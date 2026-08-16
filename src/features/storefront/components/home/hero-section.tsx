import Image from 'next/image';
import Link from 'next/link';

import { getHeroContent } from '../../api/service';

export async function HeroSection() {
  const hero = await getHeroContent();

  return (
    <section className='relative h-[100svh] w-full overflow-hidden lg:h-300' data-node-id='1:86'>
      <Image
        src={hero.image_url}
        alt={hero.title}
        fill
        priority
        className='object-cover object-center'
        sizes='100vw'
      />
      {/* Figma title: bottom 114px center, 30.5/40 Georgia, left 40 */}
      <div className='absolute bottom-28 left-6 flex max-w-[min(326px,calc(100%-3rem))] items-center sm:left-10 lg:bottom-28.5 lg:h-13 lg:w-81.5 lg:-translate-y-1/2'>
        <h1 className='font-[Georgia,Times_New_Roman,serif] text-[28px] leading-9 tracking-[0.42px] text-white lg:text-[30.5px] lg:leading-10'>
          {hero.title}
        </h1>
      </div>
      {/* Figma CTA: bottom 36, left 40, 263.78 × 38 */}
      <Link
        href={hero.href}
        className='absolute bottom-9 left-6 flex h-9.5 max-w-[calc(100%-3rem)] items-center justify-center bg-white px-4 text-[14px] leading-3.5 tracking-[0.28px] text-[#120d12] sm:left-10 lg:w-66 lg:px-0'
      >
        {hero.subtitle}
      </Link>
    </section>
  );
}
