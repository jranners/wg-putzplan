import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
    it('combines class names correctly', () => {
        expect(cn('base', 'extra')).toBe('base extra');
    });

    it('handles conditional classes', () => {
        expect(cn('base', true && 'is-true', false && 'is-false')).toBe('base is-true');
    });

    it('merges tailwind classes correctly', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2');
    });
});
