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
