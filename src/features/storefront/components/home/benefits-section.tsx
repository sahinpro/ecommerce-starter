import { getBenefits } from '../../api/service';
import { BenefitsCarousel } from './benefits-carousel';

export async function BenefitsSection() {
  const benefits = await getBenefits();

  return (
    <section className='pb-0' data-node-id='1:159'>
      <h2 className='px-2 pt-10 pb-8 text-[20px] leading-6 font-bold tracking-[0.2px] uppercase md:px-4 md:pt-10 md:pb-8'>
        Benefits of cashmere
      </h2>
      <BenefitsCarousel benefits={benefits} />
    </section>
  );
}
