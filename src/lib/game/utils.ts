/**
 * Music Industry Simulator - Utility Functions
 *
 * Helper functions for formatting, calculations, and common operations.
 *
 * Includes:
 * - Number and money formatting with suffixes (K, M, B, T)
 * - Time and duration formatting
 * - Math utilities (clamp, lerp, random)
 *
 * All formatters handle edge cases like negative numbers,
 * very large numbers, NaN, and Infinity.
 */

/**
 * Formats a money value with currency symbol and suffixes
 *
 * Converts large numbers to readable format with K, M, B, T suffixes.
 * Examples:
 * - 123 → "$123"
 * - 1234 → "$1.23K"
 * - 1234567 → "$1.23M"
 * - 1234567890 → "$1.23B"
 * - 1234567890000 → "$1.23T"
 *
 * @param amount - Money amount to format
 * @returns Formatted money string with $ symbol
 *
 * @example
 * ```typescript
 * formatMoney(1500) // "$1.50K"
 * formatMoney(1000000) // "$1.00M"
 * formatMoney(-500) // "-$500"
 * ```
 */
export function formatMoney(amount: number): string {
	// Handle edge cases
	if (!isFinite(amount)) {
		return '$0';
	}

	// Handle negative numbers
	const isNegative = amount < 0;
	const absAmount = Math.abs(amount);

	let formatted: string;

	if (absAmount >= 1e12) {
		// Trillions
		formatted = `$${(absAmount / 1e12).toFixed(2)}T`;
	} else if (absAmount >= 1e9) {
		// Billions
		formatted = `$${(absAmount / 1e9).toFixed(2)}B`;
	} else if (absAmount >= 1e6) {
		// Millions
		formatted = `$${(absAmount / 1e6).toFixed(2)}M`;
	} else if (absAmount >= 1e3) {
		// Thousands
		formatted = `$${(absAmount / 1e3).toFixed(2)}K`;
	} else {
		// Less than 1000
		formatted = `$${absAmount.toFixed(0)}`;
	}

	return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats a number with suffixes (K, M, B, T)
 *
 * Similar to formatMoney but without currency symbol.
 * Useful for displaying fans, songs, plays, etc.
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1500) // "1.50K"
 * formatNumber(1000000) // "1.00M"
 * formatNumber(42) // "42"
 * ```
 */
export function formatNumber(num: number): string {
	// Handle edge cases
	if (!isFinite(num)) {
		return '0';
	}

	const isNegative = num < 0;
	const absNum = Math.abs(num);

	let formatted: string;

	if (absNum >= 1e12) {
		formatted = `${(absNum / 1e12).toFixed(2)}T`;
	} else if (absNum >= 1e9) {
		formatted = `${(absNum / 1e9).toFixed(2)}B`;
	} else if (absNum >= 1e6) {
		formatted = `${(absNum / 1e6).toFixed(2)}M`;
	} else if (absNum >= 1e3) {
		formatted = `${(absNum / 1e3).toFixed(2)}K`;
	} else {
		formatted = absNum.toFixed(0);
	}

	return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats seconds into human-readable time string
 *
 * Formats time as MM:SS or HH:MM:SS if over 1 hour.
 * Examples:
 * - 45 → "0:45"
 * - 125 → "2:05"
 * - 3661 → "1:01:01"
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (MM:SS or HH:MM:SS)
 *
 * @example
 * ```typescript
 * formatTime(90) // "1:30"
 * formatTime(3665) // "1:01:05"
 * ```
 */
export function formatTime(seconds: number): string {
	// Handle edge cases
	if (!isFinite(seconds) || seconds < 0) {
		return '0:00';
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		// Format as HH:MM:SS
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	} else {
		// Format as MM:SS
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}
}

/**
 * Formats milliseconds into human-readable duration
 *
 * Formats duration with appropriate units (ms, s, m, h, d).
 * Automatically chooses most readable unit.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(500) // "500ms"
 * formatDuration(5000) // "5s"
 * formatDuration(120000) // "2m"
 * formatDuration(3600000) // "1h"
 * ```
 */
export function formatDuration(ms: number): string {
	// Handle edge cases
	if (!isFinite(ms) || ms < 0) {
		return '0ms';
	}

	const seconds = ms / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;
	const days = hours / 24;

	if (days >= 1) {
		return `${days.toFixed(1)}d`;
	} else if (hours >= 1) {
		return `${hours.toFixed(1)}h`;
	} else if (minutes >= 1) {
		return `${minutes.toFixed(1)}m`;
	} else if (seconds >= 1) {
		return `${seconds.toFixed(1)}s`;
	} else {
		return `${ms.toFixed(0)}ms`;
	}
}

/**
 * Clamps a value between min and max
 *
 * Ensures value stays within specified bounds.
 * Useful for preventing out-of-range values.
 *
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value between min and max
 *
 * @example
 * ```typescript
 * clamp(5, 0, 10) // 5
 * clamp(-5, 0, 10) // 0
 * clamp(15, 0, 10) // 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 *
 * Interpolates between a and b based on t (0-1).
 * Useful for animations and smooth transitions.
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * lerp(0, 100, 0.5) // 50
 * lerp(10, 20, 0.25) // 12.5
 * lerp(0, 100, 0) // 0
 * lerp(0, 100, 1) // 100
 * ```
 */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/**
 * Gets a random integer between min and max (inclusive)
 *
 * Uses Math.random() for randomness.
 * Both min and max are inclusive in the result.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max
 *
 * @example
 * ```typescript
 * getRandomInt(1, 6) // Random number 1-6 (dice roll)
 * getRandomInt(0, 100) // Random number 0-100
 * ```
 */
export function getRandomInt(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a percentage value
 *
 * Formats number as percentage with 1 decimal place.
 *
 * @param value - Value to format (0-1 or 0-100)
 * @param isDecimal - If true, treats value as 0-1, else as 0-100
 * @returns Formatted percentage string
 *
 * @example
 * ```typescript
 * formatPercentage(0.5, true) // "50.0%"
 * formatPercentage(75, false) // "75.0%"
 * ```
 */
export function formatPercentage(value: number, isDecimal: boolean = true): string {
	if (!isFinite(value)) {
		return '0.0%';
	}

	const percentage = isDecimal ? value * 100 : value;
	return `${percentage.toFixed(1)}%`;
}

/**
 * Calculates percentage change between two values
 *
 * Returns the percentage change from old value to new value.
 *
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Percentage change (positive = increase, negative = decrease)
 *
 * @example
 * ```typescript
 * percentageChange(100, 150) // 50 (50% increase)
 * percentageChange(100, 75) // -25 (25% decrease)
 * ```
 */
export function percentageChange(oldValue: number, newValue: number): number {
	if (oldValue === 0) {
		return newValue > 0 ? 100 : 0;
	}
	return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Rounds a number to specified decimal places
 *
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 *
 * @example
 * ```typescript
 * roundTo(3.14159, 2) // 3.14
 * roundTo(123.456, 0) // 123
 * ```
 */
export function roundTo(value: number, decimals: number): number {
	const multiplier = Math.pow(10, decimals);
	return Math.round(value * multiplier) / multiplier;
}
