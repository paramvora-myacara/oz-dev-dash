import { describe, it, expect } from 'vitest';

// Example test to verify Vitest setup
describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello, World!';
    expect(greeting.toLowerCase()).toBe('hello, world!');
    expect(greeting).toContain('World');
  });
});
