'use client';

import { useState } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import type { DateRange } from 'react-day-picker';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  localYmd,
  parseLocalYmd,
  presetFromRange,
  thisMonthRange,
  thisWeekRange,
  todayRange,
  type DatePreset
} from '../date-range';

const PRESET_LABEL: Record<DatePreset, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
  custom: 'Custom range'
};

export function OrdersDateFilter() {
  const [params, setParams] = useQueryStates(
    {
      date_from: parseAsString,
      date_to: parseAsString
    },
    { shallow: false }
  );

  const [showCustom, setShowCustom] = useState(false);

  const preset = presetFromRange(params.date_from, params.date_to);
  const label = preset ? PRESET_LABEL[preset] : 'All dates';
  const range: DateRange | undefined =
    params.date_from && params.date_to
      ? { from: parseLocalYmd(params.date_from), to: parseLocalYmd(params.date_to) }
      : undefined;

  function applyPreset(next: Exclude<DatePreset, 'custom'>) {
    setShowCustom(false);
    const bounds =
      next === 'today' ? todayRange() : next === 'week' ? thisWeekRange() : thisMonthRange();
    void setParams({ date_from: bounds.from, date_to: bounds.to });
  }

  return (
    <div className='flex flex-col gap-3'>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant='outline' size='sm' className='cursor-pointer gap-2' />}
        >
          <Icons.calendar className='size-3.5' />
          {label}
          <Icons.chevronDown className='size-3.5' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem
            onClick={() => {
              setShowCustom(false);
              void setParams({ date_from: null, date_to: null });
            }}
          >
            All dates
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset('today')}>Today</DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset('week')}>This week</DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset('month')}>This month</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCustom(true)}>Custom range</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showCustom || preset === 'custom' ? (
        <Calendar
          mode='range'
          numberOfMonths={2}
          selected={range}
          className='rounded-md border'
          onSelect={(next) => {
            if (!next?.from) return;
            void setParams({
              date_from: localYmd(next.from),
              date_to: localYmd(next.to ?? next.from)
            });
          }}
        />
      ) : null}
    </div>
  );
}
