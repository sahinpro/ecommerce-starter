import type { ProductOption, ProductOptionValue } from './types';

/** Cartesian combinations in option position order. Never returns duplicates. */
export function generateOptionCombinations(options: ProductOption[]): ProductOptionValue[][] {
  const sorted = options
    .toSorted((a, b) => a.position - b.position)
    .filter((option) => option.values.length > 0);

  if (sorted.length === 0) return [];

  return sorted.reduce<ProductOptionValue[][]>((combos, option) => {
    const values = option.values.toSorted(
      (a, b) => a.position - b.position || a.name.localeCompare(b.name)
    );
    if (combos.length === 0) {
      return values.map((value) => [value]);
    }
    return combos.flatMap((combo) => values.map((value) => [...combo, value]));
  }, []);
}

export function combinationKey(values: ProductOptionValue[]): string {
  return values.map((value) => value.id).join(':');
}

export function combinationLabel(values: ProductOptionValue[]): string {
  return values.map((value) => value.name).join(' / ');
}

export function isColorOptionName(name: string): boolean {
  return name.trim().toLowerCase() === 'color';
}
