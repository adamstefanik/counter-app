import { describe, expect, it } from 'vitest';
import { daysUntil, localDateIso } from './holiday-date';

describe('holiday-date', () => {
  describe('daysUntil', () => {
    it('should return the number of days between two dates', () => {
      expect(daysUntil('2026-09-28', '2026-09-16')).toBe(12);
    });

    it('should return zero for the same day', () => {
      expect(daysUntil('2026-09-28', '2026-09-28')).toBe(0);
    });

    it('should handle the year boundary', () => {
      expect(daysUntil('2027-01-01', '2026-12-31')).toBe(1);
    });

    it('should not be affected by the daylight saving time change', () => {
      expect(daysUntil('2026-03-30', '2026-03-28')).toBe(2);
    });

    it('should return a negative number for a past date', () => {
      expect(daysUntil('2026-09-10', '2026-09-16')).toBe(-6);
    });
  });

  describe('localDateIso', () => {
    it('should format a local date with zero padding', () => {
      expect(localDateIso(new Date(2026, 8, 5))).toBe('2026-09-05');
    });
  });
});