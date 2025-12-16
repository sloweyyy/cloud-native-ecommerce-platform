import {
  formatCurrency,
  formatDate,
  formatNumber,
  truncateText,
} from './formatUtils';

describe('formatUtils', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('handles different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toContain('100');
      expect(formatCurrency(100, 'GBP')).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('formats date in short format', () => {
      const date = '2024-01-15T00:00:00Z';
      const result = formatDate(date, 'short');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('formats date in long format', () => {
      const date = '2024-01-15T00:00:00Z';
      const result = formatDate(date, 'long');
      expect(result).toContain('January');
      expect(result).toContain('15');
    });

    it('formats relative dates correctly', () => {
      const today = new Date().toISOString();
      expect(formatDate(today, 'relative')).toBe('Today');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDate(yesterday.toISOString(), 'relative')).toBe('Yesterday');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than max length', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncateText(text, 20)).toBe('This is a very long...');
    });

    it('returns original text if shorter than max length', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('handles exact length', () => {
      const text = 'Exactly twenty chars';
      expect(truncateText(text, 20)).toBe('Exactly twenty chars');
    });
  });
});




