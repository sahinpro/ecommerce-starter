import Image from 'next/image';
import Link from 'next/link';

import { getCollectionTiles } from '../../api/service';

export async function CategoryTilesSection() {
  const tiles = await getCollectionTiles();

  return (
    <section className='grid grid-cols-1 md:grid-cols-3'>
      {tiles.map((tile) => (
        <Link key={tile.id} href={tile.href} className='group relative block'>
          <div className='bg-muted relative aspect-[640/853] overflow-hidden'>
            <Image
              src={tile.image_url}
              alt={tile.title}
              fill
              className='object-cover transition-transform duration-700 group-hover:scale-[1.02]'
              sizes='(max-width: 768px) 100vw, 33vw'
            />
          </div>
          <div className='absolute bottom-5 left-5 text-white'>
            <h2 className='font-serif text-2xl'>{tile.title}</h2>
            <p className='mt-2 text-sm underline-offset-4 group-hover:underline'>
              {tile.cta}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
