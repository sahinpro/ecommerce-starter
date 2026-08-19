'use client';

import { cn } from '@/lib/utils';

import type { FilterOptions } from '../../api/types';

type FilterSheetProps = {
  options: FilterOptions;
  selectedSizes: string[];
  selectedColors: string[];
  selectedTypes: string[];
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onToggleType: (type: string) => void;
  onClearSizes: () => void;
  onClearColors: () => void;
  onClearTypes: () => void;
  onApply: () => void;
  onClear: () => void;
};

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='space-y-4'>
      <p className='text-xs tracking-[0.15em] uppercase'>{title}</p>
      <div className='flex flex-wrap gap-x-6 gap-y-3'>{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 text-[13px] transition-colors',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', active ? 'bg-foreground' : 'bg-muted-foreground/40')}
      />
      {label}
    </button>
  );
}

export function FilterPanel({
  options,
  selectedSizes,
  selectedColors,
  selectedTypes,
  onToggleSize,
  onToggleColor,
  onToggleType,
  onClearSizes,
  onClearColors,
  onClearTypes,
  onApply,
  onClear
}: FilterSheetProps) {
  return (
    <div className='space-y-10 p-10'>
      <div className='flex items-center justify-between'>
        <h2 className='font-serif text-2xl'>Filter</h2>
        <button
          type='button'
          onClick={onClear}
          className='text-muted-foreground text-sm hover:text-foreground'
        >
          Clear all
        </button>
      </div>

      <FilterGroup title='Product Type'>
        <FilterChip label='All' active={selectedTypes.length === 0} onClick={onClearTypes} />
        {options.product_types.map((type) => (
          <FilterChip
            key={type}
            label={type}
            active={selectedTypes.includes(type)}
            onClick={() => onToggleType(type)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title='Size'>
        <FilterChip label='All' active={selectedSizes.length === 0} onClick={onClearSizes} />
        {options.sizes.map((size) => (
          <FilterChip
            key={size}
            label={size}
            active={selectedSizes.includes(size)}
            onClick={() => onToggleSize(size)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title='Colour'>
        <FilterChip label='All' active={selectedColors.length === 0} onClick={onClearColors} />
        {options.colors.map((color) => (
          <FilterChip
            key={color.name}
            label={color.name}
            active={selectedColors.includes(color.name)}
            onClick={() => onToggleColor(color.name)}
          />
        ))}
      </FilterGroup>

      <button
        type='button'
        onClick={onApply}
        className='bg-primary text-primary-foreground h-11 w-full text-sm tracking-wide uppercase'
      >
        Apply Filters
      </button>
    </div>
  );
}
