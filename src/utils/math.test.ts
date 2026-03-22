import { describe, it, expect } from 'vitest';
import {
  vec2Add, vec2Sub, vec2Scale, vec2Len, vec2Normalize, vec2Dist,
  rectsOverlap, pointInRect, clamp, lerp, randomInt, randomFloat, generateId
} from './math';

describe('Vec2 operations', () => {
  it('adds vectors', () => {
    expect(vec2Add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it('subtracts vectors', () => {
    expect(vec2Sub({ x: 5, y: 7 }, { x: 2, y: 3 })).toEqual({ x: 3, y: 4 });
  });

  it('scales vectors', () => {
    expect(vec2Scale({ x: 3, y: 4 }, 2)).toEqual({ x: 6, y: 8 });
  });

  it('calculates vector length', () => {
    expect(vec2Len({ x: 3, y: 4 })).toBe(5);
  });

  it('normalizes vectors', () => {
    const n = vec2Normalize({ x: 3, y: 4 });
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
  });

  it('normalizes zero vector', () => {
    expect(vec2Normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('calculates distance', () => {
    expect(vec2Dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe('Rect operations', () => {
  it('detects overlapping rects', () => {
    expect(rectsOverlap(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 5, y: 5, width: 10, height: 10 }
    )).toBe(true);
  });

  it('detects non-overlapping rects', () => {
    expect(rectsOverlap(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 20, y: 20, width: 10, height: 10 }
    )).toBe(false);
  });

  it('detects point in rect', () => {
    expect(pointInRect({ x: 5, y: 5 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(true);
    expect(pointInRect({ x: 15, y: 5 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
  });
});

describe('Utility functions', () => {
  it('clamps values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('lerps values', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('generates random ints in range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('generates random floats in range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomFloat(1.0, 2.0);
      expect(val).toBeGreaterThanOrEqual(1.0);
      expect(val).toBeLessThan(2.0);
    }
  });

  it('generates unique ids', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});
