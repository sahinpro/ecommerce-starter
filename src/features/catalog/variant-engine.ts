import type { ProductOption, ProductOptionValue, ProductVariant } from './types';

const NAMED_SIZE_RANK: Record<string, number> = {
  os: 4,
  'one size': 4,
  free: 4,
  xxxxs: 10,
  xxxs: 20,
  xxs: 30,
  xs: 40,
  s: 50,
  m: 60,
  l: 70,
  xl: 80,
  xll: 85,
  xxl: 90,
  '2xl': 90,
  xxxl: 100,
  '3xl': 100,
  xxxxl: 110,
  '4xl': 110
};

function sizeRank(size: string): number {
  const key = size.trim().toLowerCase().replace(/\s+/g, ' ');
  if (key in NAMED_SIZE_RANK) return NAMED_SIZE_RANK[key];
  const numeric = Number(key);
  if (Number.isFinite(numeric)) return 200 + numeric;
  return 1000;
}

/** S, M, L, XL (not alphabetical L, M, S, XL). */
export function compareApparelSizes(a: string, b: string): number {
  const rankDelta = sizeRank(a) - sizeRank(b);
  if (rankDelta !== 0) return rankDelta;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function isSizeOptionName(name: string): boolean {
  return name.trim().toLowerCase() === 'size';
}

export function sortSizeValues<T extends { name: string }>(values: T[]): T[] {
  return values.toSorted((a, b) => compareApparelSizes(a.name, b.name));
}

export function variantSizeName(
  variant: Pick<ProductVariant, 'option_values'> & { size?: string }
): string {
  return (
    variant.size ||
    variant.option_values.find((value) => isSizeOptionName(value.option_name))?.value_name ||
    ''
  );
}

/** Cartesian combinations in option position order. Never returns duplicates. */
export function generateOptionCombinations(options: ProductOption[]): ProductOptionValue[][] {
  const sorted = options
    .toSorted((a, b) => a.position - b.position)
    .filter((option) => option.values.length > 0);

  if (sorted.length === 0) return [];

  return sorted.reduce<ProductOptionValue[][]>((combos, option) => {
    const values = isSizeOptionName(option.name)
      ? sortSizeValues(option.values)
      : option.values.toSorted((a, b) => a.position - b.position || a.name.localeCompare(b.name));
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

export function colorOptionOf(options: ProductOption[]): ProductOption | undefined {
  return options.find((option) => isColorOptionName(option.name));
}

export function variantColorValueId(
  variant: Pick<ProductVariant, 'option_values' | 'color_id'>,
  colorOption?: ProductOption
): string | null {
  if (colorOption) {
    const match = variant.option_values.find((value) =>
      colorOption.values.some((color) => color.id === value.value_id)
    );
    if (match) return match.value_id;
  }
  return variant.color_id;
}

export type VariantColorGroup<T extends Pick<ProductVariant, 'option_values' | 'color_id'>> = {
  key: string;
  colorValue: ProductOptionValue | null;
  variants: T[];
};

export function groupVariantsByColor<T extends Pick<ProductVariant, 'option_values' | 'color_id'>>(
  variants: T[],
  options: ProductOption[]
): VariantColorGroup<T>[] {
  const colorOption = colorOptionOf(options);
  if (!colorOption) {
    return [
      {
        key: 'all',
        colorValue: null,
        variants: variants.toSorted((a, b) =>
          compareApparelSizes(variantSizeName(a), variantSizeName(b))
        )
      }
    ];
  }

  const byValue = new Map<string, T[]>();
  const unmatched: T[] = [];

  for (const variant of variants) {
    const valueId = variantColorValueId(variant, colorOption);
    if (!valueId) {
      unmatched.push(variant);
      continue;
    }
    const list = byValue.get(valueId) ?? [];
    list.push(variant);
    byValue.set(valueId, list);
  }

  const groups: VariantColorGroup<T>[] = colorOption.values
    .map((value) => ({
      key: value.id,
      colorValue: value,
      variants: (byValue.get(value.id) ?? []).toSorted((a, b) =>
        compareApparelSizes(variantSizeName(a), variantSizeName(b))
      )
    }))
    .filter((group) => group.variants.length > 0);

  if (unmatched.length > 0) {
    groups.push({
      key: 'other',
      colorValue: null,
      variants: unmatched.toSorted((a, b) =>
        compareApparelSizes(variantSizeName(a), variantSizeName(b))
      )
    });
  }

  return groups;
}
