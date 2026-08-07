import { describe, it, expect } from 'vitest';
import {
  formatJson,
  minifyJson,
  jsonToTypescript,
  jsonToZod,
  jsonToGoStruct,
  jsonToPythonDataclass,
} from './index';

describe('JSON Tools Package', () => {
  const sampleJson = '{"name":"DevKit","version":1,"active":true}';

  it('formats JSON accurately', () => {
    const res = formatJson(sampleJson, { indent: 2 });
    expect(res.success).toBe(true);
    expect(res.result).toContain('"name": "DevKit"');
  });

  it('minifies formatted JSON accurately', () => {
    const formatted = formatJson(sampleJson, { indent: 4 }).result;
    const minified = minifyJson(formatted);
    expect(minified.success).toBe(true);
    expect(minified.result).toBe(sampleJson);
  });

  it('converts JSON to TypeScript interfaces', () => {
    const res = jsonToTypescript(sampleJson, 'DevConfig');
    expect(res.success).toBe(true);
    expect(res.result).toContain('export interface DevConfig');
    expect(res.result).toContain('name: string;');
  });

  it('converts JSON to Zod schema', () => {
    const res = jsonToZod(sampleJson, 'configSchema');
    expect(res.success).toBe(true);
    expect(res.result).toContain('export const configSchema = z.object({');
  });

  it('converts JSON to Go Struct', () => {
    const res = jsonToGoStruct(sampleJson, 'Config');
    expect(res.success).toBe(true);
    expect(res.result).toContain('type Config struct');
    expect(res.result).toContain('Name string `json:"name"`');
  });

  it('converts JSON to Python Dataclass', () => {
    const res = jsonToPythonDataclass(sampleJson, 'Config');
    expect(res.success).toBe(true);
    expect(res.result).toContain('@dataclass');
    expect(res.result).toContain('class Config:');
  });
});
