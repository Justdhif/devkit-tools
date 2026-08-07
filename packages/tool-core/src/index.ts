import { ToolMetadata } from '@devkit/shared';

export const CORE_TOOLS: ToolMetadata[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter / Validator / Minifier',
    slug: 'json-formatter',
    category: 'JSON',
    description: 'Format, validate, minify, and sort keys in JSON documents.',
    keywords: ['json', 'format', 'minify', 'validate', 'pretty', 'sort', 'lint'],
    iconName: 'Braces',
    isPopular: true,
  },
  {
    id: 'json-to-typescript',
    name: 'JSON → TypeScript / Zod / Struct',
    slug: 'json-to-typescript',
    category: 'JSON',
    description: 'Convert raw JSON objects into TypeScript interfaces, Zod schemas, Go structs, or Python dataclasses.',
    keywords: ['json', 'typescript', 'zod', 'go', 'python', 'schema', 'type', 'interface'],
    iconName: 'Code2',
    isPopular: true,
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder & Inspector',
    slug: 'jwt-decoder',
    category: 'JWT / Security',
    description: 'Decode and inspect JSON Web Tokens safely on your local client without sending secrets to a server.',
    keywords: ['jwt', 'token', 'decode', 'bearer', 'security', 'auth', 'expiration'],
    iconName: 'ShieldCheck',
    isPopular: true,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    slug: 'uuid-generator',
    category: 'Generators',
    description: 'Generate bulk cryptographically secure v4 and v7 UUIDs.',
    keywords: ['uuid', 'guid', 'v4', 'v7', 'generator', 'random', 'id'],
    iconName: 'Fingerprint',
    isPopular: true,
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder / Decoder',
    slug: 'base64-encoder',
    category: 'Utilities',
    description: 'Encode and decode standard and URL-safe Base64 strings.',
    keywords: ['base64', 'encode', 'decode', 'string', 'binary', 'urlsafe'],
    iconName: 'Binary',
    isPopular: true,
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    slug: 'url-encoder',
    category: 'Utilities',
    description: 'Encode, decode, and parse query parameters from URLs.',
    keywords: ['url', 'uri', 'percent', 'query', 'encode', 'decode', 'parser'],
    iconName: 'Link',
    isPopular: true,
  },
  {
    id: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    slug: 'timestamp-converter',
    category: 'Date & Color',
    description: 'Convert Unix epoch timestamps (seconds/milliseconds) to human-readable dates and vice versa.',
    keywords: ['timestamp', 'epoch', 'date', 'unix', 'time', 'iso8601', 'converter'],
    iconName: 'Clock',
    isPopular: true,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    slug: 'hash-generator',
    category: 'JWT / Security',
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 cryptographic digests client-side.',
    keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'crypto', 'digest'],
    iconName: 'KeyRound',
    isPopular: true,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'Regex',
    description: 'Test regular expressions against target text with real-time highlight matches and flag options.',
    keywords: ['regex', 'regexp', 'match', 'pattern', 'test', 'replace'],
    iconName: 'Regex',
    isPopular: false,
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter & Minifier',
    slug: 'sql-formatter',
    category: 'SQL',
    description: 'Format, clean, and beautify raw SQL queries with custom dialect syntax.',
    keywords: ['sql', 'postgres', 'mysql', 'format', 'minify', 'database', 'query'],
    iconName: 'Database',
    isPopular: false,
  },
];

export function getToolBySlug(slug: string): ToolMetadata | undefined {
  return CORE_TOOLS.find((t) => t.slug === slug);
}

export function searchTools(query: string): ToolMetadata[] {
  const q = query.toLowerCase().trim();
  if (!q) return CORE_TOOLS;
  return CORE_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
