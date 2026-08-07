import { describe, it, expect } from 'vitest';
import {
  generateUuidV4,
  generateUuidV7,
  generateBulkUuids,
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  parseTimestamp,
  computeHash,
} from './index';

describe('Crypto & Utility Tools Package', () => {
  it('generates valid v4 UUIDs', () => {
    const uuid = generateUuidV4();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates valid v7 time-ordered UUIDs', () => {
    const uuid = generateUuidV7();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates bulk UUID lists', () => {
    const uuids = generateBulkUuids(10, 'v4');
    expect(uuids.length).toBe(10);
  });

  it('encodes and decodes Base64 strings', () => {
    const input = 'Hello DevKit 2026!';
    const encoded = encodeBase64(input);
    const decoded = decodeBase64(encoded);
    expect(decoded).toBe(input);
  });

  it('encodes and decodes URL strings', () => {
    const raw = 'developer tools & utilities';
    const encoded = encodeUrl(raw);
    const decoded = decodeUrl(encoded);
    expect(decoded).toBe(raw);
  });

  it('parses timestamps correctly', () => {
    const epochSec = 1700000000;
    const res = parseTimestamp(epochSec);
    expect(res).not.toBeNull();
    expect(res?.unixSeconds).toBe(1700000000);
    expect(res?.iso).toBe(new Date(1700000000 * 1000).toISOString());
  });

  it('computes MD5 hash digests', async () => {
    const hash = await computeHash('devkit', 'MD5');
    expect(hash).toBe('baec7d9412e68718ce88defce24486ae');
  });
});
