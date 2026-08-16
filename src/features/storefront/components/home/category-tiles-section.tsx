import { getCollectionTiles } from '../../api/service';
import { CategoryTiles } from './category-tiles';

export async function CategoryTilesSection() {
  const tiles = await getCollectionTiles();

  return <CategoryTiles tiles={tiles} />;
}
