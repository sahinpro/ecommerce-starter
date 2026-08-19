'use client';

import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/;

export const APPAREL_COLOR_PRESETS = [
  { label: 'Black', hex: '#111111' },
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Cream', hex: '#E8D5B5' },
  { label: 'Beige', hex: '#C4B7A6' },
  { label: 'Pink', hex: '#E8A0BF' },
  { label: 'Red', hex: '#C23B3B' },
  { label: 'Burgundy', hex: '#722F37' },
  { label: 'Navy', hex: '#1B2A4A' },
  { label: 'Olive', hex: '#6B7C3A' },
  { label: 'Brown', hex: '#6B4F3A' },
  { label: 'Grey', hex: '#8A8A8A' },
  { label: 'Sand', hex: '#D6C4A8' }
] as const;

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!HEX_PATTERN.test(withHash)) return null;
  return withHash.toUpperCase();
}

export function hexForColorName(name: string): string | null {
  const match = APPAREL_COLOR_PRESETS.find(
    (preset) => preset.label.toLowerCase() === name.trim().toLowerCase()
  );
  return match?.hex ?? null;
}

export function ColorSwatchPicker({
  value,
  onChange,
  disabled = false,
  labelledBy
}: {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  labelledBy?: string;
}) {
  const hex = normalizeHex(value) ?? '#111111';
  const [draft, setDraft] = useState(hex);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft(hex);
  }, [hex]);

  function commit(next: string) {
    const normalized = normalizeHex(next);
    if (!normalized) {
      setDraft(hex);
      return;
    }
    setDraft(normalized);
    if (normalized !== hex) onChange(normalized);
  }

  return (
    <div className='flex items-center gap-2'>
      <label
        className={cn(
          'relative size-9 shrink-0 overflow-hidden rounded-md border shadow-xs',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        )}
      >
        <span className='absolute inset-0' style={{ backgroundColor: hex }} aria-hidden />
        <input
          type='color'
          value={hex.toLowerCase()}
          disabled={disabled}
          aria-labelledby={labelledBy}
          aria-label='Pick color'
          className='absolute inset-0 cursor-pointer opacity-0'
          onChange={(event) => commit(event.target.value)}
        />
      </label>
      <Input
        value={draft}
        disabled={disabled}
        spellCheck={false}
        aria-label='Color hex'
        className='h-9 w-26 font-mono text-xs uppercase'
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit(draft);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              type='button'
              variant='outline'
              size='icon'
              disabled={disabled}
              className='size-9 cursor-pointer'
              aria-label='Color presets'
            />
          }
        >
          <Icons.palette className='size-4' />
        </PopoverTrigger>
        <PopoverContent align='start' className='w-56 p-3'>
          <p className='text-muted-foreground mb-2 text-[11px] tracking-wide uppercase'>Presets</p>
          <div className='grid grid-cols-6 gap-1.5'>
            {APPAREL_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type='button'
                title={preset.label}
                aria-label={preset.label}
                className={cn(
                  'size-7 rounded-md border',
                  hex.toUpperCase() === preset.hex ? 'ring-foreground ring-2 ring-offset-1' : ''
                )}
                style={{ backgroundColor: preset.hex }}
                onClick={() => {
                  commit(preset.hex);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
