import Image from 'next/image';
import Link from 'next/link';

import { getCollectionTiles } from '../../api/service';

export async function CategoryTilesSection() {
  const tiles = await getCollectionTiles();

  return (
    <section className='grid grid-cols-1 md:grid-cols-3' data-node-id='1:91'>
      {tiles.map((tile) => (
        <Link
          key={tile.id}
          href={tile.href}
          className='group relative block h-[70vh] md:h-[853.33px]'
        >
          <Image
            src={tile.image_url}
            alt={tile.title}
            fill
            className='object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]'
            sizes='(max-width: 768px) 100vw, 33vw'
          />
          {/* Figma: title center at top 785.33 → ~68px from bottom; Shop Now top 812.33 */}
          <div className='absolute right-5 bottom-[41px] left-5 text-white'>
            <h2 className='font-[Georgia,Times_New_Roman,serif] text-[22.3px] leading-6 tracking-[0.3px]'>
              {tile.title}
            </h2>
            <span className='mt-[3px] inline-block border-b border-white text-[13px] leading-[13px] tracking-[0.26px]'>
              {tile.cta}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
