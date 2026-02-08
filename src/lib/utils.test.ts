import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  describe('basic class merging', () => {
    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });

    it('should return single class unchanged', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('should merge multiple classes', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('should handle null values', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar');
    });

    it('should handle false values', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar');
    });

    it('should handle empty strings', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar');
    });
  });

  describe('conditional classes', () => {
    it('should include class when condition is true', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    it('should exclude class when condition is false', () => {
      const isActive = false;
      expect(cn('base', isActive && 'active')).toBe('base');
    });

    it('should handle object syntax', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });
  });

  describe('tailwind class merging', () => {
    it('should merge padding classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should merge margin classes correctly', () => {
      expect(cn('m-4', 'm-8')).toBe('m-8');
    });

    it('should merge text color classes correctly', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should merge background color classes correctly', () => {
      expect(cn('bg-white', 'bg-gray-100')).toBe('bg-gray-100');
    });

    it('should not merge different utility types', () => {
      const result = cn('p-4', 'm-4');
      expect(result).toContain('p-4');
      expect(result).toContain('m-4');
    });

    it('should merge conflicting width classes', () => {
      expect(cn('w-full', 'w-1/2')).toBe('w-1/2');
    });

    it('should merge conflicting height classes', () => {
      expect(cn('h-screen', 'h-full')).toBe('h-full');
    });

    it('should merge font weight classes', () => {
      expect(cn('font-normal', 'font-bold')).toBe('font-bold');
    });

    it('should merge flex direction classes', () => {
      expect(cn('flex-row', 'flex-col')).toBe('flex-col');
    });
  });

  describe('array syntax', () => {
    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
    });
  });

  describe('real-world usage patterns', () => {
    it('should handle button variant pattern', () => {
      const variant = 'primary';
      const size = 'md';

      const result = cn(
        'inline-flex items-center justify-center rounded-md',
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
        },
        {
          'h-9 px-4 py-2': size === 'md',
          'h-10 px-8': size === 'lg',
        }
      );

      expect(result).toContain('inline-flex');
      expect(result).toContain('bg-primary');
      expect(result).toContain('h-9');
      expect(result).not.toContain('bg-secondary');
      expect(result).not.toContain('h-10');
    });

    it('should handle className override pattern', () => {
      const baseClasses = 'text-sm text-gray-500 p-4';
      const userClasses = 'text-lg p-2';

      const result = cn(baseClasses, userClasses);

      // User classes should override base classes
      expect(result).toContain('text-lg');
      expect(result).toContain('p-2');
      expect(result).not.toContain('text-sm');
      expect(result).not.toContain('p-4');
    });
  });
});
