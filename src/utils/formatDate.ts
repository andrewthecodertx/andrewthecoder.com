/**
 * Format a date string or Date object as "Jun 5, 2026".
 *
 * Avoids the UTC offset bug: `new Date("2026-06-05")` is parsed as UTC
 * midnight, so toLocaleDateString in negative-UTC-offset timezones (e.g.
 * CST/CDT) shifts the displayed day back by one ("Jun 4" instead of "Jun 5").
 *
 * We always extract the intended year/month/day from UTC getters (for Date
 * objects) or by manual parsing (for strings), then construct a local-time
 * Date so toLocaleDateString renders the author's intended date.
 */
export function formatDate(input: string | Date): string {
  let year: number, month: number, day: number;

  if (input instanceof Date) {
    // Astro content collections parse YAML dates as UTC-midnight Date objects.
    // Use UTC getters to get the author's intended calendar date, then build
    // a local-time Date for locale formatting.
    year = input.getUTCFullYear();
    month = input.getUTCMonth();
    day = input.getUTCDate();
  } else {
    // Strip any time component, then parse YYYY-MM-DD manually.
    const datePart = input.split('T')[0];
    [year, month, day] = datePart.split('-').map(Number);
    month -= 1; // JS months are 0-indexed
  }

  return new Date(year, month, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
