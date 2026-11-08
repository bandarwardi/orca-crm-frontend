/**
 * Standard Arabic Date & Time Formatting Utilities
 * Standard: Date before time, 23/9/2026 - 5:30 م style, Arabic AM/PM markers.
 */

export interface ParsedDateTime {
  year: number;
  month: number;
  day: number;
  hours12: number;
  hours24: number;
  minutes: string;
  ampm: 'ص' | 'م';
}

/**
 * Formats a Date object, ISO string, or timestamp into:
 * `D/M/YYYY - H:MM ص|م` (e.g. `23/9/2026 - 5:30 م`)
 */
export function formatArabicDateTime(input: Date | string | number | null | undefined): string {
  if (!input) return '';

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    return String(input);
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const rawHours = date.getHours();
  const ampm: 'ص' | 'م' = rawHours >= 12 ? 'م' : 'ص';
  const hours12 = rawHours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} - ${hours12}:${minutes} ${ampm}`;
}

/**
 * Formats a Date object, ISO string, or timestamp into date only:
 * `D/M/YYYY` (e.g. `23/9/2026`)
 */
export function formatArabicDate(input: Date | string | number | null | undefined): string {
  if (!input) return '';

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    return String(input);
  }

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
 * Formats a Date object, ISO string, or timestamp into time only:
 * `H:MM ص|م` (e.g. `5:30 م`)
 */
export function formatArabicTime(input: Date | string | number | null | undefined): string {
  if (!input) return '';

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    return String(input);
  }

  const rawHours = date.getHours();
  const ampm = rawHours >= 12 ? 'م' : 'ص';
  const hours12 = rawHours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours12}:${minutes} ${ampm}`;
}

/**
 * Converts a standard input string or badge text into ISO datetime-local string (YYYY-MM-DDTHH:mm)
 */
export function parseToIsoDateTime(val: string | null | undefined): string {
  if (!val) return '';
  if (val.includes('T') && !isNaN(new Date(val).getTime())) {
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}`;
  }

  const now = new Date();
  if (val.includes('غداً')) {
    now.setDate(now.getDate() + 1);
  } else if (val.includes('بعد يومين')) {
    now.setDate(now.getDate() + 2);
  } else if (val.includes('الأسبوع القادم')) {
    now.setDate(now.getDate() + 7);
  }

  const timeMatch = val.match(/(\d{1,2}):(\d{2})\s*(م|ص)/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3];
    if (ampm === 'م' && h < 12) h += 12;
    if (ampm === 'ص' && h === 12) h = 0;
    now.setHours(h, m, 0, 0);
  } else {
    now.setHours(17, 30, 0, 0);
  }

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
}
