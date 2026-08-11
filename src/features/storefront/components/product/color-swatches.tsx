import { cn } from '@/lib/utils';

import type { ProductColor } from '../../api/types';

type ColorSwatchesProps = {
  colors: ProductColor[];
  selectedId?: string;
  onSelect?: (color: ProductColor) => void;
  size?: 'sm' | 'md';
  className?: string;
};

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  size = 'sm',
  className
}: ColorSwatchesProps) {
  const dotSize = size === 'sm' ? 'size-3' : 'size-5';

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colors.map((color) => {
        const isSelected = selectedId === color.id;

        if (onSelect) {
          return (
            <button
              key={color.id}
              type='button'
              onClick={() => onSelect(color)}
              aria-label={color.name}
              className={cn(
                dotSize,
                'rounded-full border transition-transform hover:scale-110',
                isSelected ? 'ring-foreground ring-1 ring-offset-2' : 'border-black/10'
              )}
              style={{ backgroundColor: color.hex }}
            />
          );
        }

        return (
          <span
            key={color.id}
            className={cn(dotSize, 'rounded-full border border-black/10')}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        );
      })}
    </div>
  );
}
