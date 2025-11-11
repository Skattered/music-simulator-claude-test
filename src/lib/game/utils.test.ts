/**
 * Unit tests for Utility Functions
 *
 * Tests all formatting, calculation, and helper functions
 */

import { describe, it, expect } from 'vitest';
import {
	formatMoney,
	formatNumber,
	formatTime,
	formatDuration,
	clamp,
	lerp,
	getRandomInt,
	formatPercentage,
	percentageChange,
	roundTo
} from './utils';

describe('Utility Functions', () => {
	describe('formatMoney()', () => {
		it('should format small amounts without suffix', () => {
			expect(formatMoney(0)).toBe('$0');
			expect(formatMoney(42)).toBe('$42');
			expect(formatMoney(999)).toBe('$999');
		});

		it('should format thousands with K suffix', () => {
			expect(formatMoney(1000)).toBe('$1.00K');
			expect(formatMoney(1500)).toBe('$1.50K');
			expect(formatMoney(999999)).toBe('$1000.00K');
		});

		it('should format millions with M suffix', () => {
			expect(formatMoney(1000000)).toBe('$1.00M');
			expect(formatMoney(1234567)).toBe('$1.23M');
			expect(formatMoney(999999999)).toBe('$1000.00M');
		});

		it('should format billions with B suffix', () => {
			expect(formatMoney(1000000000)).toBe('$1.00B');
			expect(formatMoney(1234567890)).toBe('$1.23B');
		});

		it('should format trillions with T suffix', () => {
			expect(formatMoney(1000000000000)).toBe('$1.00T');
			expect(formatMoney(1234567890123)).toBe('$1.23T');
		});

		it('should handle negative numbers', () => {
			expect(formatMoney(-100)).toBe('-$100');
			expect(formatMoney(-1500)).toBe('-$1.50K');
			expect(formatMoney(-1000000)).toBe('-$1.00M');
		});

		it('should handle edge cases', () => {
			expect(formatMoney(NaN)).toBe('$0');
			expect(formatMoney(Infinity)).toBe('$0');
			expect(formatMoney(-Infinity)).toBe('$0');
		});
	});

	describe('formatNumber()', () => {
		it('should format small numbers without suffix', () => {
			expect(formatNumber(0)).toBe('0');
			expect(formatNumber(42)).toBe('42');
			expect(formatNumber(999)).toBe('999');
		});

		it('should format thousands with K suffix', () => {
			expect(formatNumber(1000)).toBe('1.00K');
			expect(formatNumber(5000)).toBe('5.00K');
		});

		it('should format millions with M suffix', () => {
			expect(formatNumber(1000000)).toBe('1.00M');
			expect(formatNumber(1234567)).toBe('1.23M');
		});

		it('should format billions with B suffix', () => {
			expect(formatNumber(1000000000)).toBe('1.00B');
		});

		it('should format trillions with T suffix', () => {
			expect(formatNumber(1000000000000)).toBe('1.00T');
		});

		it('should handle negative numbers', () => {
			expect(formatNumber(-100)).toBe('-100');
			expect(formatNumber(-5000)).toBe('-5.00K');
		});

		it('should handle edge cases', () => {
			expect(formatNumber(NaN)).toBe('0');
			expect(formatNumber(Infinity)).toBe('0');
		});
	});

	describe('formatTime()', () => {
		it('should format seconds as MM:SS', () => {
			expect(formatTime(0)).toBe('0:00');
			expect(formatTime(30)).toBe('0:30');
			expect(formatTime(90)).toBe('1:30');
			expect(formatTime(599)).toBe('9:59');
		});

		it('should format hours as HH:MM:SS', () => {
			expect(formatTime(3600)).toBe('1:00:00');
			expect(formatTime(3661)).toBe('1:01:01');
			expect(formatTime(7265)).toBe('2:01:05');
		});

		it('should handle edge cases', () => {
			expect(formatTime(-10)).toBe('0:00');
			expect(formatTime(NaN)).toBe('0:00');
			expect(formatTime(Infinity)).toBe('0:00');
		});

		it('should pad single digits with zero', () => {
			expect(formatTime(65)).toBe('1:05');
			expect(formatTime(3605)).toBe('1:00:05');
		});
	});

	describe('formatDuration()', () => {
		it('should format milliseconds', () => {
			expect(formatDuration(100)).toBe('100ms');
			expect(formatDuration(999)).toBe('999ms');
		});

		it('should format seconds', () => {
			expect(formatDuration(1000)).toBe('1.0s');
			expect(formatDuration(5500)).toBe('5.5s');
		});

		it('should format minutes', () => {
			expect(formatDuration(60000)).toBe('1.0m');
			expect(formatDuration(150000)).toBe('2.5m');
		});

		it('should format hours', () => {
			expect(formatDuration(3600000)).toBe('1.0h');
			expect(formatDuration(5400000)).toBe('1.5h');
		});

		it('should format days', () => {
			expect(formatDuration(86400000)).toBe('1.0d');
			expect(formatDuration(172800000)).toBe('2.0d');
		});

		it('should handle edge cases', () => {
			expect(formatDuration(0)).toBe('0ms');
			expect(formatDuration(-100)).toBe('0ms');
			expect(formatDuration(NaN)).toBe('0ms');
		});
	});

	describe('clamp()', () => {
		it('should clamp value within range', () => {
			expect(clamp(5, 0, 10)).toBe(5);
			expect(clamp(0, 0, 10)).toBe(0);
			expect(clamp(10, 0, 10)).toBe(10);
		});

		it('should clamp below minimum', () => {
			expect(clamp(-5, 0, 10)).toBe(0);
			expect(clamp(-100, 0, 10)).toBe(0);
		});

		it('should clamp above maximum', () => {
			expect(clamp(15, 0, 10)).toBe(10);
			expect(clamp(100, 0, 10)).toBe(10);
		});

		it('should handle negative ranges', () => {
			expect(clamp(-5, -10, 0)).toBe(-5);
			expect(clamp(-15, -10, 0)).toBe(-10);
			expect(clamp(5, -10, 0)).toBe(0);
		});

		it('should handle floating point values', () => {
			expect(clamp(2.5, 0, 5)).toBe(2.5);
			expect(clamp(5.5, 0, 5)).toBe(5);
		});
	});

	describe('lerp()', () => {
		it('should interpolate between values', () => {
			expect(lerp(0, 100, 0.5)).toBe(50);
			expect(lerp(0, 100, 0.25)).toBe(25);
			expect(lerp(0, 100, 0.75)).toBe(75);
		});

		it('should return start value at t=0', () => {
			expect(lerp(10, 20, 0)).toBe(10);
			expect(lerp(0, 100, 0)).toBe(0);
		});

		it('should return end value at t=1', () => {
			expect(lerp(10, 20, 1)).toBe(20);
			expect(lerp(0, 100, 1)).toBe(100);
		});

		it('should handle negative values', () => {
			expect(lerp(-10, 10, 0.5)).toBe(0);
			expect(lerp(-100, -50, 0.5)).toBe(-75);
		});

		it('should extrapolate outside 0-1 range', () => {
			expect(lerp(0, 100, 1.5)).toBe(150);
			expect(lerp(0, 100, -0.5)).toBe(-50);
		});
	});

	describe('getRandomInt()', () => {
		it('should generate integers within range', () => {
			for (let i = 0; i < 100; i++) {
				const result = getRandomInt(1, 10);
				expect(result).toBeGreaterThanOrEqual(1);
				expect(result).toBeLessThanOrEqual(10);
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		it('should include min and max values', () => {
			// This is probabilistic but with 1000 iterations, very likely to hit both
			const results = new Set();
			for (let i = 0; i < 1000; i++) {
				results.add(getRandomInt(1, 3));
			}
			expect(results.has(1)).toBe(true);
			expect(results.has(3)).toBe(true);
		});

		it('should handle single value range', () => {
			expect(getRandomInt(5, 5)).toBe(5);
		});

		it('should handle negative ranges', () => {
			for (let i = 0; i < 100; i++) {
				const result = getRandomInt(-10, -1);
				expect(result).toBeGreaterThanOrEqual(-10);
				expect(result).toBeLessThanOrEqual(-1);
			}
		});
	});

	describe('formatPercentage()', () => {
		it('should format decimal values', () => {
			expect(formatPercentage(0.5, true)).toBe('50.0%');
			expect(formatPercentage(0.25, true)).toBe('25.0%');
			expect(formatPercentage(1.0, true)).toBe('100.0%');
		});

		it('should format whole number values', () => {
			expect(formatPercentage(50, false)).toBe('50.0%');
			expect(formatPercentage(75, false)).toBe('75.0%');
			expect(formatPercentage(100, false)).toBe('100.0%');
		});

		it('should handle edge cases', () => {
			expect(formatPercentage(0, true)).toBe('0.0%');
			expect(formatPercentage(NaN, true)).toBe('0.0%');
			expect(formatPercentage(Infinity, true)).toBe('0.0%');
		});

		it('should use one decimal place', () => {
			expect(formatPercentage(0.333, true)).toBe('33.3%');
			expect(formatPercentage(0.666, true)).toBe('66.6%');
		});
	});

	describe('percentageChange()', () => {
		it('should calculate positive change', () => {
			expect(percentageChange(100, 150)).toBe(50);
			expect(percentageChange(100, 200)).toBe(100);
		});

		it('should calculate negative change', () => {
			expect(percentageChange(100, 75)).toBe(-25);
			expect(percentageChange(100, 50)).toBe(-50);
		});

		it('should handle zero change', () => {
			expect(percentageChange(100, 100)).toBe(0);
		});

		it('should handle zero old value', () => {
			expect(percentageChange(0, 100)).toBe(100);
			expect(percentageChange(0, 0)).toBe(0);
		});

		it('should handle decimal values', () => {
			const change = percentageChange(100, 110);
			expect(change).toBeCloseTo(10, 1);
		});
	});

	describe('roundTo()', () => {
		it('should round to specified decimal places', () => {
			expect(roundTo(3.14159, 2)).toBe(3.14);
			expect(roundTo(3.14159, 3)).toBe(3.142);
			expect(roundTo(3.14159, 0)).toBe(3);
		});

		it('should handle whole numbers', () => {
			expect(roundTo(123, 2)).toBe(123);
			expect(roundTo(123.456, 0)).toBe(123);
		});

		it('should handle negative numbers', () => {
			expect(roundTo(-3.14159, 2)).toBe(-3.14);
			expect(roundTo(-123.456, 0)).toBe(-123);
		});

		it('should handle rounding up', () => {
			expect(roundTo(1.555, 2)).toBe(1.56); // Rounds up
			expect(roundTo(1.445, 2)).toBe(1.45); // Rounds up
		});
	});
});
