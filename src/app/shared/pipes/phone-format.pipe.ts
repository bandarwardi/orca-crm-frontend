import { Pipe, PipeTransform } from '@angular/core';

/**
 * Format raw phone number into standard US / International format:
 * e.g. 13135550192 -> +1 (313) 555-0192
 */
export function formatPhoneNumber(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length > 6) {
    return `+${digits}`;
  }
  return value;
}

/**
 * Normalizes Eastern Arabic-Indic numerals (٠-٩) and Persian numerals (۰-۹) to standard Western digits (0-9).
 */
export function normalizeDigits(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

/**
 * Extracts digits only from a phone string (after normalizing Arabic digits).
 */
export function extractPhoneDigits(phone: string | null | undefined): string {
  if (!phone) return '';
  return normalizeDigits(phone).replace(/\D/g, '');
}

/**
 * Matches a phone number against a query regardless of formatting:
 * - Handles country code +1 / 001 / 1
 * - Handles brackets, hyphens, spaces: (313) 555-0199 vs 3135550199 vs 313-555
 * - Handles Arabic numbers: ٣١٣٥٥٥
 * - Handles partial matches: e.g. last 4 digits "0199"
 */
export function matchesPhone(rawPhone: string | null | undefined, rawQuery: string | null | undefined): boolean {
  if (!rawPhone || !rawQuery) return false;

  const phoneNorm = normalizeDigits(rawPhone).toLowerCase();
  const queryNorm = normalizeDigits(rawQuery).toLowerCase();

  // 1. Direct textual match or substring
  if (phoneNorm.includes(queryNorm)) return true;

  // 2. Digits-only matching
  const phoneDigits = extractPhoneDigits(rawPhone);
  const queryDigits = extractPhoneDigits(rawQuery);

  if (queryDigits.length >= 2) {
    if (phoneDigits.includes(queryDigits)) return true;

    // US 10 vs 11 digits matching (+1 prefix)
    const phoneUS10 = phoneDigits.startsWith('1') && phoneDigits.length === 11 ? phoneDigits.slice(1) : phoneDigits;
    const queryUS10 = queryDigits.startsWith('1') && queryDigits.length === 11 ? queryDigits.slice(1) : queryDigits;

    if (
      phoneUS10.includes(queryDigits) ||
      phoneDigits.includes(queryUS10) ||
      phoneUS10.includes(queryUS10)
    ) {
      return true;
    }

    // Handles international prefix 00
    const queryNo00 = queryDigits.startsWith('00') ? queryDigits.slice(2) : queryDigits;
    if (phoneDigits.includes(queryNo00) || phoneUS10.includes(queryNo00)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes Arabic text for flexible search (أ, إ, آ -> ا, ة -> ه, ى -> ي, removes tashkeel)
 */
export function normalizeArabicSearch(text: string | null | undefined): string {
  if (!text) return '';
  return normalizeDigits(String(text))
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatPhoneNumber(value);
  }
}

