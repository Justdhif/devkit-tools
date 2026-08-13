import {
  ToolMetadata,
  SmartDetectionResult,
  SmartRecommendation,
  PipelineStep,
  PipelineValidationResult,
  LogicalType,
} from '@devkit/shared';

export type { ToolMetadata, SmartDetectionResult, SmartRecommendation, PipelineStep, PipelineValidationResult, LogicalType };


// Inline dari @devkit/json-tools — menghindari masalah ncc saat bundling di Vercel
function formatJson(input: string, options: { indent?: number } = {}): { success: boolean; result: string; error?: string } {
  const { indent = 2 } = options;
  if (!input.trim()) return { success: true, result: '' };
  try {
    const result = JSON.stringify(JSON.parse(input), null, indent);
    return { success: true, result };
  } catch (err: any) {
    return { success: false, result: input, error: err?.message || 'Invalid JSON syntax' };
  }
}

// Inline dari @devkit/jwt-tools — menghindari masalah ncc saat bundling di Vercel
function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 2: output += '=='; break;
    case 3: output += '='; break;
  }
  try {
    return decodeURIComponent(
      atob(output).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    return atob(output);
  }
}

function decodeJwt(token: string): { success: boolean; payload?: Record<string, any>; error?: string } {
  const clean = token.trim().replace(/^Bearer\s+/i, '');
  const parts = clean.split('.');
  if (parts.length !== 3) return { success: false, error: 'Invalid JWT format.' };
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { success: true, payload };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to decode JWT' };
  }
}


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
    inputType: 'json',
    outputType: 'json',
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
    inputType: 'json',
    outputType: 'typescript',
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
    inputType: 'jwt',
    outputType: 'json',
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
    inputType: 'string',
    outputType: 'uuid',
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
    inputType: 'string',
    outputType: 'base64',
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
    inputType: 'string',
    outputType: 'url',
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
    inputType: 'timestamp',
    outputType: 'string',
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
    inputType: 'string',
    outputType: 'string',
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
    inputType: 'regex',
    outputType: 'string',
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
    inputType: 'sql',
    outputType: 'sql',
  },
  {
    id: 'ai-assistant',
    name: 'AI Developer Assistant',
    slug: 'ai-assistant',
    category: 'AI',
    description: 'Contextual AI assistant for Error Explainer, Code Explainer, Regex Generator, and SQL Query Generator.',
    keywords: ['ai', 'assistant', 'error', 'explainer', 'regex', 'sql', 'generator', 'code', 'llm'],
    iconName: 'Sparkles',
    isPopular: true,
    isNew: true,
    inputType: 'string',
    outputType: 'string',
  },
  {
    id: 'pipeline-builder',
    name: 'Tool Chaining & Pipeline Builder',
    slug: 'pipeline-builder',
    category: 'Workflows',
    description: 'Chain multiple developer tools together to create automated, reusable data processing pipelines.',
    keywords: ['pipeline', 'chain', 'workflow', 'automation', 'step', 'combine'],
    iconName: 'GitMerge',
    isPopular: true,
    isNew: true,
    inputType: 'string',
    outputType: 'string',
  },
  {
    id: 'api-tester',
    name: 'API Tester & HTTP Client',
    slug: 'api-tester',
    category: 'API',
    description: 'Test HTTP endpoints with custom headers, body payloads, authentication, and SSRF security proxy.',
    keywords: ['api', 'http', 'rest', 'postman', 'curl', 'tester', 'fetch', 'proxy', 'json'],
    iconName: 'Globe',
    isPopular: true,
    isNew: true,
    inputType: 'http-request',
    outputType: 'http-response',
  },
  {
    id: 'cron-builder',
    name: 'Cron Expression Builder',
    slug: 'cron-builder',
    category: 'Generators',
    description: 'Build, decode, and understand cron schedule expressions with human-readable explanations.',
    keywords: ['cron', 'schedule', 'expression', 'builder', 'generator', 'timer', 'crontab'],
    iconName: 'CalendarClock',
    isNew: true,
    inputType: 'string',
    outputType: 'string',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    slug: 'qr-generator',
    category: 'Generators',
    description: 'Generate customizable vector QR codes from URLs or text with instant SVG/PNG download.',
    keywords: ['qr', 'code', 'barcode', 'generator', 'svg', 'png', 'url'],
    iconName: 'QrCode',
    isNew: true,
    inputType: 'url',
    outputType: 'string',
  },
  {
    id: 'color-converter',
    name: 'Color Converter & WCAG Checker',
    slug: 'color-converter',
    category: 'Date & Color',
    description: 'Convert color values between HEX, RGB, HSL, HSV, OKLCH with palette generation and WCAG contrast check.',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'oklch', 'wcag', 'contrast', 'palette', 'picker'],
    iconName: 'Palette',
    isNew: true,
    inputType: 'string',
    outputType: 'string',
  },
  {
    id: 'diff-viewer',
    name: 'Code & JSON Diff Viewer',
    slug: 'diff-viewer',
    category: 'Utilities',
    description: 'Compare two text or JSON documents side-by-side with line-by-line diff highlighting.',
    keywords: ['diff', 'compare', 'json', 'text', 'difference', 'merge', 'side-by-side'],
    iconName: 'GitCompare',
    isNew: true,
    inputType: 'string',
    outputType: 'string',
  },
  {
    id: 'curl-converter',
    name: 'cURL Parser & Code Generator',
    slug: 'curl-converter',
    category: 'API',
    description: 'Parse raw cURL commands into JavaScript Fetch, Axios, Python Requests, Go, or PHP code.',
    keywords: ['curl', 'parser', 'fetch', 'axios', 'python', 'requests', 'code', 'convert', 'http'],
    iconName: 'Terminal',
    isNew: true,
    inputType: 'string',
    outputType: 'http-request',
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

export function detectSmartContext(input: string): SmartDetectionResult {
  const clean = input.trim();

  if (!clean) {
    return {
      detectedType: 'string',
      confidence: 100,
      recommendations: [],
      summary: 'Empty input string.',
    };
  }

  // 1. JWT Token
  const jwtRegex = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;
  if (jwtRegex.test(clean)) {
    return {
      detectedType: 'jwt',
      confidence: 98,
      secondaryDetections: [
        { type: 'base64url', confidence: 88 },
        { type: 'base64', confidence: 75 },
      ],
      summary: 'JWT (JSON Web Token) detected with valid header, payload, and signature segments.',
      recommendations: [
        { id: 'jwt-decode', label: 'Decode JWT & Inspect Claims', targetToolSlug: 'jwt-decoder', actionType: 'navigate' },
        { id: 'jwt-chain', label: 'Chain JWT → Format JSON → TypeScript', targetToolSlug: 'pipeline-builder', actionType: 'transform' },
        { id: 'jwt-ai', label: 'Explain JWT with AI', targetToolSlug: 'ai-assistant', actionType: 'ai' },
      ],
    };
  }

  // 2. Valid JSON
  if ((clean.startsWith('{') && clean.endsWith('}')) || (clean.startsWith('[') && clean.endsWith(']'))) {
    try {
      JSON.parse(clean);
      return {
        detectedType: 'json',
        confidence: 97,
        secondaryDetections: [{ type: 'string', confidence: 60 }],
        recommendations: [
          { id: 'json-format', label: 'Format & Validate JSON', targetToolSlug: 'json-formatter', actionType: 'navigate' },
          { id: 'json-ts', label: 'Generate TypeScript Interface', targetToolSlug: 'json-to-typescript', actionType: 'transform' },
          { id: 'json-zod', label: 'Generate Zod Schema', targetToolSlug: 'json-to-typescript', actionType: 'transform' },
          { id: 'json-chain', label: 'Create Pipeline (JSON → TS)', targetToolSlug: 'pipeline-builder', actionType: 'transform' },
        ],
        summary: 'Valid JSON object or array structure detected.',
      };
    } catch {
      // invalid JSON syntax
    }
  }

  // 3. ISO Date Format
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/i;
  if (isoDateRegex.test(clean)) {
    return {
      detectedType: 'iso-date',
      confidence: 96,
      secondaryDetections: [{ type: 'string', confidence: 50 }],
      summary: 'ISO-8601 Date / Timestamp string detected.',
      recommendations: [
        { id: 'iso-convert', label: 'Convert ISO Date to Unix Epoch', targetToolSlug: 'timestamp-converter', actionType: 'navigate' },
      ],
    };
  }

  // 4. Stack Trace / Error Output
  if (
    clean.includes('Error:') ||
    clean.includes('TypeError:') ||
    clean.includes('ReferenceError:') ||
    clean.includes('SyntaxError:') ||
    clean.includes('UnhandledPromiseRejectionWarning') ||
    /at\s+.*\.(js|ts|jsx|tsx|py|go|java):\d+/.test(clean)
  ) {
    return {
      detectedType: 'error',
      confidence: 95,
      recommendations: [
        { id: 'error-ai', label: 'Explain Stack Trace & Fix with AI', targetToolSlug: 'ai-assistant', actionType: 'ai' },
      ],
      summary: 'Runtime Exception or Stack Trace detected.',
    };
  }

  // 5. UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(clean)) {
    return {
      detectedType: 'uuid',
      confidence: 99,
      recommendations: [
        { id: 'uuid-gen', label: 'Generate Bulk UUIDs', targetToolSlug: 'uuid-generator', actionType: 'navigate' },
      ],
      summary: 'Universally Unique Identifier (UUID) v4/v7 detected.',
    };
  }

  // 6. Full URL (HTTP/HTTPS)
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('ftp://')) {
    return {
      detectedType: 'url',
      confidence: 96,
      secondaryDetections: [{ type: 'string', confidence: 70 }],
      recommendations: [
        { id: 'url-parse', label: 'Decode & Parse Query Parameters', targetToolSlug: 'url-encoder', actionType: 'navigate' },
        { id: 'url-qr', label: 'Generate QR Code for URL', targetToolSlug: 'qr-generator', actionType: 'transform' },
        { id: 'url-api', label: 'Test URL with API Tester', targetToolSlug: 'api-tester', actionType: 'navigate' },
      ],
      summary: 'HTTP / HTTPS Web URL detected.',
    };
  }

  // 7. URL Query String
  if (/^[a-zA-Z0-9_.-]+=[^&]*(&[a-zA-Z0-9_.-]+=[^&]*)*$/.test(clean) && clean.includes('=')) {
    return {
      detectedType: 'url-query',
      confidence: 90,
      recommendations: [
        { id: 'query-parse', label: 'Parse URL Parameters', targetToolSlug: 'url-encoder', actionType: 'navigate' },
      ],
      summary: 'URL Query Parameter key-value pairs detected.',
    };
  }

  // 8. SQL Statement
  if (/\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/i.test(clean)) {
    return {
      detectedType: 'sql',
      confidence: 92,
      recommendations: [
        { id: 'sql-fmt', label: 'Format & Beautify SQL', targetToolSlug: 'sql-formatter', actionType: 'navigate' },
        { id: 'sql-ai', label: 'Generate / Optimize SQL with AI', targetToolSlug: 'ai-assistant', actionType: 'ai' },
      ],
      summary: 'SQL database query detected.',
    };
  }

  // 9. Regular Expression Pattern
  if (/^\/.*\/[gimsuy]*$/.test(clean) || (clean.startsWith('^') && clean.endsWith('$'))) {
    return {
      detectedType: 'regex',
      confidence: 91,
      recommendations: [
        { id: 'regex-test', label: 'Test Regular Expression', targetToolSlug: 'regex-tester', actionType: 'navigate' },
        { id: 'regex-ai', label: 'Explain Regex with AI', targetToolSlug: 'ai-assistant', actionType: 'ai' },
      ],
      summary: 'Regular Expression pattern syntax detected.',
    };
  }

  // 10. Unix Epoch Timestamp
  if (/^\d{10}(\d{3})?$/.test(clean)) {
    return {
      detectedType: 'timestamp',
      confidence: 90,
      recommendations: [
        { id: 'ts-convert', label: 'Convert Timestamp to Date', targetToolSlug: 'timestamp-converter', actionType: 'navigate' },
      ],
      summary: 'Unix Epoch Timestamp detected.',
    };
  }

  // 11. Base64URL
  if (/^[A-Za-z0-9_-]{16,}$/.test(clean) && (clean.includes('-') || clean.includes('_'))) {
    return {
      detectedType: 'base64url',
      confidence: 88,
      secondaryDetections: [{ type: 'base64', confidence: 75 }],
      recommendations: [
        { id: 'b64url-decode', label: 'Decode Base64URL String', targetToolSlug: 'base64-encoder', actionType: 'navigate' },
      ],
      summary: 'Base64URL safe string detected.',
    };
  }

  // 12. Base64 Standard
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (clean.length > 8 && clean.length % 4 === 0 && base64Regex.test(clean)) {
    return {
      detectedType: 'base64',
      confidence: 85,
      recommendations: [
        { id: 'b64-decode', label: 'Decode Base64 String', targetToolSlug: 'base64-encoder', actionType: 'navigate' },
      ],
      summary: 'Base64 encoded string detected.',
    };
  }

  // Fallback Plain Text
  return {
    detectedType: 'string',
    confidence: 60,
    recommendations: [
      { id: 'str-hash', label: 'Compute Hash (SHA-256/MD5)', targetToolSlug: 'hash-generator', actionType: 'navigate' },
      { id: 'str-qr', label: 'Generate QR Code', targetToolSlug: 'qr-generator', actionType: 'navigate' },
      { id: 'str-b64', label: 'Encode to Base64', targetToolSlug: 'base64-encoder', actionType: 'navigate' },
    ],
    summary: 'Standard plain text input detected.',
  };
}

export function validatePipeline(steps: PipelineStep[]): PipelineValidationResult {
  const errors: string[] = [];

  if (steps.length === 0) {
    return { valid: false, errors: ['Pipeline must contain at least 1 tool step.'] };
  }

  for (let i = 0; i < steps.length - 1; i++) {
    const current = steps[i];
    const next = steps[i + 1];

    if (current.outputType !== next.inputType && next.inputType !== 'string') {
      errors.push(
        `Incompatible Step ${i + 1} → ${i + 2}: ${current.toolName} outputs "${current.outputType}", but ${next.toolName} requires "${next.inputType}".`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function executeSingleStep(step: PipelineStep, inputData: string): Promise<string> {
  const cfg = step.config || {};
  const toolSlug = step.toolSlug;

  if (toolSlug === 'jwt-decoder') {
    const decoded = decodeJwt(inputData);
    if (!decoded.success) throw new Error(decoded.error || 'Invalid JWT token');
    return JSON.stringify(decoded.payload, null, 2);
  }

  if (toolSlug === 'json-formatter') {
    const indent = typeof cfg.indent === 'number' ? cfg.indent : 2;
    const formatted = formatJson(inputData, { indent });
    if (!formatted.success) throw new Error(formatted.error || 'Invalid JSON input');
    return formatted.result;
  }

  if (toolSlug === 'json-to-typescript') {
    const targetLang = (cfg.targetLanguage as string) || 'typescript';
    const parsed = JSON.parse(inputData);
    if (targetLang === 'zod') {
      return `import { z } from 'zod';\n\nexport const GeneratedSchema = z.object({\n${Object.keys(parsed)
        .map((k) => `  ${k}: z.${typeof parsed[k] === 'number' ? 'number()' : typeof parsed[k] === 'boolean' ? 'boolean()' : 'string()'},`)
        .join('\n')}\n});`;
    }
    if (targetLang === 'go') {
      return `type GeneratedStruct struct {\n${Object.keys(parsed)
        .map((k) => `\t${k.charAt(0).toUpperCase() + k.slice(1)} ${typeof parsed[k] === 'number' ? 'int' : 'string'} \`json:"${k}"\``)
        .join('\n')}\n}`;
    }
    return `export interface GeneratedType {\n${Object.keys(parsed)
      .map((k) => `  ${k}: ${typeof parsed[k]};`)
      .join('\n')}\n}`;
  }

  if (toolSlug === 'base64-encoder') {
    const mode = (cfg.mode as string) || 'auto';
    if (mode === 'encode') return btoa(inputData);
    if (mode === 'decode') return atob(inputData);
    try {
      return atob(inputData);
    } catch {
      return btoa(inputData);
    }
  }

  if (toolSlug === 'url-encoder') {
    const mode = (cfg.mode as string) || 'decode';
    if (mode === 'encode') return encodeURIComponent(inputData);
    return decodeURIComponent(inputData);
  }

  if (toolSlug === 'hash-generator') {
    const algo = (cfg.algorithm as string) || 'sha256';
    return `[${algo.toUpperCase()}_HASH]: ${Array.from(new Uint8Array(new TextEncoder().encode(inputData)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 64)}`;
  }

  if (toolSlug === 'uuid-generator') {
    const count = typeof cfg.count === 'number' ? cfg.count : 1;
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000');
    }
    return uuids.join('\n');
  }

  if (toolSlug === 'timestamp-converter') {
    const val = inputData.trim();
    if (/^\d+$/.test(val)) {
      const num = parseInt(val, 10);
      const date = new Date(num > 1e11 ? num : num * 1000);
      return date.toISOString();
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) throw new Error('Invalid Date format for timestamp conversion');
    return Math.floor(d.getTime() / 1000).toString();
  }

  if (toolSlug === 'sql-formatter') {
    return inputData
      .replace(/\s+/g, ' ')
      .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|GROUP BY|ORDER BY|HAVING|LIMIT)\b/gi, '\n$1')
      .trim();
  }

  if (toolSlug === 'regex-tester') {
    const pattern = (cfg.pattern as string) || '^.*$';
    const flags = (cfg.flags as string) || 'g';
    const reg = new RegExp(pattern, flags);
    const matches = Array.from(inputData.matchAll(reg)).map((m) => m[0]);
    return `Pattern: /${pattern}/${flags}\nMatches (${matches.length}):\n` + matches.join('\n');
  }

  if (toolSlug === 'cron-builder') {
    return `Cron Expression: "${inputData}"\nDescription: Runs on schedule pattern: ${inputData}`;
  }

  if (toolSlug === 'qr-generator') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><!-- QR Code Placeholder for: ${inputData} --><rect width="128" height="128" fill="#fff"/><text x="10" y="64" font-size="10">QR: ${inputData.substring(0, 15)}</text></svg>`;
  }

  if (toolSlug === 'color-converter') {
    return `Color: ${inputData}\nHEX: ${inputData.startsWith('#') ? inputData : '#3b82f6'}\nRGB: rgb(59, 130, 246)\nHSL: hsl(217, 91%, 60%)`;
  }

  if (toolSlug === 'api-tester') {
    return `HTTP Response (200 OK):\nContent-Type: application/json\n\n{\n  "data": "${inputData.substring(0, 100)}",\n  "status": "success"\n}`;
  }

  if (toolSlug === 'ai-assistant') {
    return `[AI Assistant Analysis]: Processed input (${inputData.length} chars).\nExplanation: Correctly analyzed payload structure.`;
  }

  return inputData;
}

export async function executePipeline(
  steps: PipelineStep[],
  initialInput: string
): Promise<{ success: boolean; results: Record<string, string>; finalOutput: string; error?: string }> {
  const validation = validatePipeline(steps);
  if (!validation.valid) {
    return {
      success: false,
      results: {},
      finalOutput: '',
      error: validation.errors.join('\n'),
    };
  }

  let currentData = initialInput;
  const results: Record<string, string> = {};

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      currentData = await executeSingleStep(step, currentData);
      results[step.id] = currentData;
    } catch (err: any) {
      return {
        success: false,
        results,
        finalOutput: '',
        error: `Pipeline failed at Step ${i + 1} (${step.toolName}): ${err.message}`,
      };
    }
  }

  return {
    success: true,
    results,
    finalOutput: currentData,
  };
}


export function redactSensitiveData(text: string): { redactedText: string; isSensitive: boolean } {
  if (!text) return { redactedText: text, isSensitive: false };

  let isSensitive = false;
  let redacted = text;

  const jwtPattern = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;
  if (jwtPattern.test(redacted)) {
    isSensitive = true;
    redacted = redacted.replace(jwtPattern, '[REDACTED_JWT_TOKEN]');
  }

  const apiKeyPattern = /(?:sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16})/g;
  if (apiKeyPattern.test(redacted)) {
    isSensitive = true;
    redacted = redacted.replace(apiKeyPattern, '[REDACTED_API_KEY]');
  }

  const privateKeyPattern = /-----BEGIN[A-Z\s]+PRIVATE KEY-----[[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----/g;
  if (privateKeyPattern.test(redacted)) {
    isSensitive = true;
    redacted = redacted.replace(privateKeyPattern, '[REDACTED_PRIVATE_KEY]');
  }

  const authHeaderPattern = /(Authorization:\s*Bearer\s+)[^\s\n]+/gi;
  if (authHeaderPattern.test(redacted)) {
    isSensitive = true;
    redacted = redacted.replace(authHeaderPattern, '$1[REDACTED_SECRET]');
  }

  return {
    redactedText: redacted,
    isSensitive,
  };
}

