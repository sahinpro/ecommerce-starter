import Image from 'next/image';

import { getBenefits } from '../../api/service';

export async function BenefitsSection() {
  const benefits = await getBenefits();

  return (
    /* Figma 1:159 — heading top 52; images top 80, 640×853.33 */
    <section className='pb-0' data-node-id='1:159'>
      <h2 className='px-10 pt-10 pb-8 text-[20px] leading-6 font-bold tracking-[0.2px] uppercase md:pt-10 md:pb-8'>
        Benefits of cashmere
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3'>
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className='relative aspect-640/853.33 overflow-hidden md:h-[853.33px] md:aspect-auto'
          >
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
        ))}
      </div>
    </section>
  );
}
