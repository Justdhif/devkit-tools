export interface JsonFormatOptions {
  indent?: number;
  sortKeys?: boolean;
}

export interface JsonProcessResult {
  success: boolean;
  result: string;
  error?: string;
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

export function formatJson(input: string, options: JsonFormatOptions = {}): JsonProcessResult {
  const { indent = 2, sortKeys = false } = options;
  if (!input.trim()) {
    return { success: true, result: '' };
  }

  try {
    let parsed = JSON.parse(input);
    if (sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    const result = JSON.stringify(parsed, null, indent);
    return { success: true, result };
  } catch (err: any) {
    return {
      success: false,
      result: input,
      error: err?.message || 'Invalid JSON syntax',
    };
  }
}

export function minifyJson(input: string): JsonProcessResult {
  if (!input.trim()) {
    return { success: true, result: '' };
  }

  try {
    const parsed = JSON.parse(input);
    const result = JSON.stringify(parsed);
    return { success: true, result };
  } catch (err: any) {
    return {
      success: false,
      result: input,
      error: err?.message || 'Invalid JSON syntax',
    };
  }
}

export function validateJson(input: string): { valid: boolean; error?: string } {
  if (!input.trim()) {
    return { valid: true };
  }
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Invalid JSON' };
  }
}

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export function jsonToTypescript(input: string, rootName: string = 'RootObject'): JsonProcessResult {
  if (!input.trim()) return { success: true, result: '' };

  try {
    const parsed = JSON.parse(input);
    const interfaces: string[] = [];

    const getType = (val: any, name: string): string => {
      if (val === null) return 'any';
      const t = typeof val;
      if (t === 'string' || t === 'number' || t === 'boolean') {
        return t;
      }
      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        const itemType = getType(val[0], name + 'Item');
        return `${itemType}[]`;
      }
      if (t === 'object') {
        const interfaceName = capitalize(name);
        generateInterface(val, interfaceName);
        return interfaceName;
      }
      return 'any';
    };

    const generateInterface = (obj: Record<string, any>, interfaceName: string) => {
      const lines: string[] = [`export interface ${interfaceName} {`];
      for (const [key, val] of Object.entries(obj)) {
        const typeStr = getType(val, key);
        lines.push(`  ${key}: ${typeStr};`);
      }
      lines.push('}');
      interfaces.push(lines.join('\n'));
    };

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      generateInterface(parsed, rootName);
    } else if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        generateInterface(parsed[0], rootName + 'Item');
        interfaces.push(`export type ${rootName} = ${rootName}Item[];`);
      } else {
        interfaces.push(`export type ${rootName} = any[];`);
      }
    } else {
      interfaces.push(`export type ${rootName} = ${typeof parsed};`);
    }

    return { success: true, result: interfaces.reverse().join('\n\n') };
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'Invalid JSON input' };
  }
}

export function jsonToZod(input: string, rootName: string = 'rootSchema'): JsonProcessResult {
  if (!input.trim()) return { success: true, result: '' };

  try {
    const parsed = JSON.parse(input);

    const generateZod = (val: any): string => {
      if (val === null) return 'z.any()';
      const t = typeof val;
      if (t === 'string') return 'z.string()';
      if (t === 'number') return 'z.number()';
      if (t === 'boolean') return 'z.boolean()';

      if (Array.isArray(val)) {
        if (val.length === 0) return 'z.array(z.any())';
        return `z.array(${generateZod(val[0])})`;
      }

      if (t === 'object') {
        const fields = Object.entries(val)
          .map(([k, v]) => `  ${k}: ${generateZod(v)},`)
          .join('\n');
        return `z.object({\n${fields}\n})`;
      }

      return 'z.any()';
    };

    const schema = `import { z } from 'zod';\n\nexport const ${rootName} = ${generateZod(parsed)};\n\nexport type ${rootName.charAt(0).toUpperCase() + rootName.slice(1)} = z.infer<typeof ${rootName}>;`;

    return { success: true, result: schema };
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'Invalid JSON input' };
  }
}

export function jsonToGoStruct(input: string, rootName: string = 'AutoGenerated'): JsonProcessResult {
  if (!input.trim()) return { success: true, result: '' };

  try {
    const parsed = JSON.parse(input);
    const structs: string[] = [];

    const getGoType = (val: any, name: string): string => {
      if (val === null) return 'interface{}';
      const t = typeof val;
      if (t === 'string') return 'string';
      if (t === 'number') return Number.isInteger(val) ? 'int' : 'float64';
      if (t === 'boolean') return 'bool';
      if (Array.isArray(val)) {
        if (val.length === 0) return '[]interface{}';
        return `[]${getGoType(val[0], name + 'Item')}`;
      }
      if (t === 'object') {
        const structName = capitalize(name);
        generateStruct(val, structName);
        return structName;
      }
      return 'interface{}';
    };

    const generateStruct = (obj: Record<string, any>, structName: string) => {
      const lines: string[] = [`type ${structName} struct {`];
      for (const [key, val] of Object.entries(obj)) {
        const fieldName = capitalize(key);
        const goType = getGoType(val, key);
        lines.push(`\t${fieldName} ${goType} \`json:"${key}"\``);
      }
      lines.push('}');
      structs.push(lines.join('\n'));
    };

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      generateStruct(parsed, rootName);
    }

    return { success: true, result: structs.reverse().join('\n\n') };
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'Invalid JSON input' };
  }
}

export function jsonToPythonDataclass(input: string, rootName: string = 'Root'): JsonProcessResult {
  if (!input.trim()) return { success: true, result: '' };

  try {
    const parsed = JSON.parse(input);
    const classes: string[] = [];

    const getPyType = (val: any, name: string): string => {
      if (val === null) return 'Any';
      const t = typeof val;
      if (t === 'string') return 'str';
      if (t === 'number') return Number.isInteger(val) ? 'int' : 'float';
      if (t === 'boolean') return 'bool';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'List[Any]';
        return `List[${getPyType(val[0], name + 'Item')}]`;
      }
      if (t === 'object') {
        const className = capitalize(name);
        generateClass(val, className);
        return className;
      }
      return 'Any';
    };

    const generateClass = (obj: Record<string, any>, className: string) => {
      const lines: string[] = ['@dataclass', `class ${className}:`];
      const entries = Object.entries(obj);
      if (entries.length === 0) {
        lines.push('    pass');
      } else {
        for (const [key, val] of entries) {
          const pyType = getPyType(val, key);
          lines.push(`    ${key}: ${pyType}`);
        }
      }
      classes.push(lines.join('\n'));
    };

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      generateClass(parsed, rootName);
    }

    const header = 'from dataclasses import dataclass\nfrom typing import List, Any\n\n';
    return { success: true, result: header + classes.reverse().join('\n\n') };
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'Invalid JSON input' };
  }
}
