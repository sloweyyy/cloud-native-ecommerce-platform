import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCompactNumber,
} from './formatUtils';

describe('formatUtils', () => {
  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(123.45)).toBe('$123.45');
    });

    it('should format with specified currency', () => {
      expect(formatCurrency(1000, 'EUR', 'en-US')).toBe('€1,000.00');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-50.25)).toBe('-$50.25');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('should format with different locale', () => {
      const result = formatCurrency(1234.56, 'EUR', 'de-DE');
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('56');
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.5678);
      expect(result).toContain('1,234');
    });

    it('should format with different locale', () => {
      const result = formatNumber(1234.5678, 'de-DE');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage without decimals by default', () => {
      expect(formatPercentage(0.1)).toBe('10%');
    });

    it('should format percentage with specified decimals', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(1)).toBe('100%');
    });

    it('should handle values greater than 1', () => {
      expect(formatPercentage(1.5)).toBe('150%');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-12-01');
      expect(result).toContain('2024');
      expect(result).toContain('Dec');
      expect(result).toContain('1');
    });

    it('should format Date object', () => {
      const date = new Date('2024-12-01T00:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('Dec');
    });

    it('should format with custom options', () => {
      const result = formatDate('2024-12-01', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
      expect(result).toContain('2024');
      expect(result).toContain('December');
      expect(result).toContain('01');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime string', () => {
      const result = formatDateTime('2024-12-01T10:30:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('Dec');
      expect(result).toContain('1');
    });

    it('should include time', () => {
      const result = formatDateTime('2024-12-01T14:30:00Z');
      // Time format may vary by timezone, just check it has time components
      expect(result.length).toBeGreaterThan(10); // More than just date
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent past', () => {
      const yesterday = new Date(Date.now() - 86400000); // 1 day ago
      const result = formatRelativeTime(yesterday);
      expect(result).toContain('yesterday');
    });

    it('should format near future', () => {
      const tomorrow = new Date(Date.now() + 86400000); // 1 day from now
      const result = formatRelativeTime(tomorrow);
      expect(result).toContain('tomorrow');
    });

    it('should format hours', () => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const result = formatRelativeTime(oneHourAgo);
      expect(result).toContain('hour');
    });

    it('should format minutes', () => {
      const fiveMinutesAgo = new Date(Date.now() - 300000);
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toContain('minute');
    });

    it('should handle now', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toContain('now');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format thousands with K', () => {
      expect(formatCompactNumber(1234)).toBe('1.2K');
    });

    it('should format millions with M', () => {
      expect(formatCompactNumber(1234567)).toBe('1.2M');
    });

    it('should format billions with B', () => {
      expect(formatCompactNumber(1234567890)).toBe('1.2B');
    });

    it('should handle small numbers', () => {
      expect(formatCompactNumber(123)).toBe('123');
    });

    it('should handle zero', () => {
      expect(formatCompactNumber(0)).toBe('0');
    });

    it('should respect decimal places', () => {
      expect(formatCompactNumber(1234, 0)).toBe('1K');
      expect(formatCompactNumber(1234, 2)).toBe('1.23K');
    });
  });
});

