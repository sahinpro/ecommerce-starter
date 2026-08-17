import { cn } from '@/lib/utils';

import type { ProductColor } from '../../api/types';

type ColorSwatchesProps = {
  colors: ProductColor[];
  selectedId?: string;
  onSelect?: (color: ProductColor) => void;
  size?: 'sm' | 'md';
  shape?: 'circle' | 'square';
  className?: string;
};

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  size = 'sm',
  shape = 'circle',
  className
}: ColorSwatchesProps) {
  const dim = shape === 'square' ? 'size-3' : size === 'sm' ? 'size-3' : 'size-5';

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {colors.map((color) => {
        const isSelected = selectedId === color.id;
        const swatchClass = cn(
          dim,
          shape === 'square' ? 'border border-black' : 'rounded-full border border-black/10',
          isSelected && shape === 'circle' && 'ring-foreground ring-1 ring-offset-2',
          onSelect && 'transition-transform hover:scale-110'
        );

        if (onSelect) {
          return (
            <button
              key={color.id}
              type='button'
              onClick={() => onSelect(color)}
              aria-label={color.name}
              className={swatchClass}
              style={{ backgroundColor: color.hex }}
            />
          );
        }

        return (
          <span
            key={color.id}
            className={swatchClass}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        );
      })}
    </div>
  );
}
