/**
 * Format a date string as "May 23, 2026".
 * Handles both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM" formats.
 * Parsing components manually avoids the UTC offset bug where
 * `new Date("2026-05-23")` is treated as UTC midnight,
 * causing locale conversion to shift the day back in negative-UTC offsets.
 */
export function formatDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
