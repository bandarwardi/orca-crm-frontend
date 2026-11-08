/**
 * Date & Time Formatting Utilities
 * Strictly uses Western Arabic numerals (0-9) and English locale formatting
 * (e.g., "10/01/2026", "5:06 PM", "Today", "Yesterday").
 */

export function parseDate(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  let str = String(dateInput).trim();
  if (!str) return null;
  // If string has date & time but no timezone offset or 'Z' (e.g. '2026-10-01 22:34:35' or '2026-10-01T22:34:35')
  // MySQL stores UTC datetime without Z, so treat it as UTC to avoid local timezone offset drift.
  if (!str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTimeEn(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateEn(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export function formatDateTimeEn(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '';
  return `${formatDateEn(d)} ${formatTimeEn(d)}`;
}

export function formatRelativeDateEn(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '';

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return formatTimeEn(d);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Yesterday';
  }

  return formatDateEn(d);
}

export function formatThreadDateDivider(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '';

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${formatTimeEn(d)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${formatTimeEn(d)}`;
  }

  return `${formatDateEn(d)}, ${formatTimeEn(d)}`;
}
