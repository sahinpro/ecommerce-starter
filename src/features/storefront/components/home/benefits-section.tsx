import Image from 'next/image';

import { getBenefits } from '../../api/service';

export async function BenefitsSection() {
  const benefits = await getBenefits();

  return (
    <section className='px-10 py-16'>
      <h2 className='mb-8 font-serif text-2xl'>Benefits of premium cotton</h2>
      <div className='grid grid-cols-1 md:grid-cols-3'>
        {benefits.map((benefit) => (
          <div key={benefit.id} className='group relative'>
            <div className='bg-muted relative aspect-[640/853] overflow-hidden'>
              <Image
                src={benefit.image_url}
                alt={benefit.title}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, 33vw'
              />
              <div className='absolute inset-0 bg-black/25' />
              <p className='absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-lg text-white'>
                {benefit.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
