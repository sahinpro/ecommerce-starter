export const STORE_TIMEZONE = 'Asia/Dhaka';

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isYmd(value: string | undefined): value is string {
  return Boolean(value && YMD.test(value));
}

export function ymdInStoreTz(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function startOfStoreDayIso(ymd: string): string {
  return new Date(`${ymd}T00:00:00+06:00`).toISOString();
}

export function endOfStoreDayIso(ymd: string): string {
  return new Date(`${ymd}T23:59:59.999+06:00`).toISOString();
}

function addStoreDays(ymd: string, days: number): string {
  const date = new Date(`${ymd}T12:00:00+06:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return ymdInStoreTz(date);
}

export type DatePreset = 'today' | 'week' | 'month' | 'custom';

export function todayRange(): { from: string; to: string } {
  const today = ymdInStoreTz();
  return { from: today, to: today };
}

export function thisWeekRange(): { from: string; to: string } {
  const today = ymdInStoreTz();
  const weekday = new Date(`${today}T12:00:00+06:00`).getUTCDay();
  return { from: addStoreDays(today, -weekday), to: today };
}

export function thisMonthRange(): { from: string; to: string } {
  const today = ymdInStoreTz();
  return { from: `${today.slice(0, 8)}01`, to: today };
}

export function presetFromRange(
  from: string | null | undefined,
  to: string | null | undefined
): DatePreset | null {
  if (!isYmd(from ?? undefined) || !isYmd(to ?? undefined)) return null;
  const today = todayRange();
  if (from === today.from && to === today.to) return 'today';
  const week = thisWeekRange();
  if (from === week.from && to === week.to) return 'week';
  const month = thisMonthRange();
  if (from === month.from && to === month.to) return 'month';
  return 'custom';
}

export function localYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalYmd(ymd: string): Date {
  const match = YMD.exec(ymd);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
