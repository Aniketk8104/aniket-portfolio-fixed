/**
 * Unit tests for placeholder utility
 * 
 * Validates Requirements 11.3, 11.4
 */

import { describe, it, expect } from 'vitest';
import { placeholder, isPlaceholder, type Placeholder } from './placeholder';

describe('placeholder utility', () => {
  describe('placeholder()', () => {
    it('creates a placeholder with the specified field name', () => {
      const p = placeholder<string>('article body');
      expect(p.__field).toBe('article body');
    });

    it('creates a placeholder that satisfies the type parameter', () => {
      // Type-level test: this should compile
      const stringPlaceholder: string | Placeholder<string> = placeholder<string>('test');
      expect(isPlaceholder(stringPlaceholder)).toBe(true);
    });

    it('creates placeholders for different types', () => {
      const stringP = placeholder<string>('name');
      const numberP = placeholder<number>('age');
      const objectP = placeholder<{ foo: string }>('config');
      
      expect(stringP.__field).toBe('name');
      expect(numberP.__field).toBe('age');
      expect(objectP.__field).toBe('config');
    });

    it('creates placeholders with different field names', () => {
      const p1 = placeholder<string>('overview');
      const p2 = placeholder<string>('context');
      
      expect(p1.__field).toBe('overview');
      expect(p2.__field).toBe('context');
    });
  });

  describe('isPlaceholder()', () => {
    it('returns true for placeholder values', () => {
      const p = placeholder<string>('test field');
      expect(isPlaceholder(p)).toBe(true);
    });

    it('returns false for regular strings', () => {
      expect(isPlaceholder('hello world')).toBe(false);
    });

    it('returns false for numbers', () => {
      expect(isPlaceholder(42)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isPlaceholder(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isPlaceholder(undefined)).toBe(false);
    });

    it('returns false for plain objects', () => {
      expect(isPlaceholder({ foo: 'bar' })).toBe(false);
    });

    it('returns false for arrays', () => {
      expect(isPlaceholder([1, 2, 3])).toBe(false);
    });

    it('returns false for objects with __field but no brand', () => {
      const fake = { __field: 'test' };
      expect(isPlaceholder(fake)).toBe(false);
    });
  });

  describe('type safety', () => {
    it('allows placeholders in union types', () => {
      type Content = {
        title: string;
        body: string | Placeholder<string>;
      };

      const draft: Content = {
        title: 'My Article',
        body: placeholder('article body')
      };

      expect(draft.title).toBe('My Article');
      expect(isPlaceholder(draft.body)).toBe(true);
      if (isPlaceholder(draft.body)) {
        expect(draft.body.__field).toBe('article body');
      }
    });

    it('preserves field name through type guard', () => {
      const value: string | Placeholder<string> = placeholder('test');
      
      if (isPlaceholder(value)) {
        // TypeScript should know value is Placeholder<string> here
        expect(value.__field).toBe('test');
      } else {
        // This branch should not execute
        expect.fail('Expected placeholder');
      }
    });
  });

  describe('edge cases', () => {
    it('handles empty field names', () => {
      const p = placeholder<string>('');
      expect(p.__field).toBe('');
      expect(isPlaceholder(p)).toBe(true);
    });

    it('handles field names with special characters', () => {
      const p = placeholder<string>('case study: overview (section 1)');
      expect(p.__field).toBe('case study: overview (section 1)');
      expect(isPlaceholder(p)).toBe(true);
    });

    it('creates distinct placeholders for same field name', () => {
      const p1 = placeholder<string>('body');
      const p2 = placeholder<string>('body');
      
      // They should both be placeholders
      expect(isPlaceholder(p1)).toBe(true);
      expect(isPlaceholder(p2)).toBe(true);
      
      // They should have the same field name
      expect(p1.__field).toBe(p2.__field);
      
      // But they are distinct objects
      expect(p1).not.toBe(p2);
    });
  });
});
