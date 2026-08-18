'use client';

import { cn } from '@/lib/utils';

export type DataTableStatusTab = {
  value: string;
  label: string;
};

export function DataTableStatusTabs({
  value,
  options,
  onChange
}: {
  value: string;
  options: readonly DataTableStatusTab[];
  onChange: (value: string) => void;
}) {
  return (
    <div
      role='tablist'
      aria-label='Filter by status'
      className='flex flex-wrap items-center gap-1 border-b'
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type='button'
            role='tab'
            aria-selected={isActive}
            className={cn(
              'text-muted-foreground hover:text-foreground -mb-px border-b-2 border-transparent px-3 py-2 text-sm transition-colors',
              isActive && 'text-foreground border-foreground font-medium'
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
