/**
 * Format a number as currency
 *
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(19.99) // "$19.99"
 * formatCurrency(1000, 'EUR', 'de-DE') // "1.000,00 €"
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a date string to a localized format
 *
 * @param date - ISO date string or Date object
 * @param format - Format type: 'short', 'long', or 'relative' (default: 'short')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15', 'short') // "Jan 15, 2024"
 * formatDate('2024-01-15', 'long') // "January 15, 2024"
 * formatDate(new Date(), 'relative') // "Today"
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short',
  locale = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateObj);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

    // For dates more than 7 days ago, fall back to short format
    format = 'short';
  }

  const formatOptions: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format a number with thousands separators
 *
 * @param num - The number to format
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText('This is a long text', 10) // "This is a..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}
