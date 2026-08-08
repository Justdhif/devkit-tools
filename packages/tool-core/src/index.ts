import {
  ToolMetadata,
  SmartDetectionResult,
  SmartRecommendation,
  PipelineStep,
  PipelineValidationResult,
  LogicalType,
} from '@devkit/shared';
import { formatJson, minifyJson } from '@devkit/json-tools';
import { decodeJwt } from '@devkit/jwt-tools';

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

// -------------------------------------------------------------------------
// SMART CONTEXT DETECTION ENGINE (Client-Side Privacy-First)
// -------------------------------------------------------------------------

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

  // 1. JWT Token Detection
  const jwtRegex = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;
  if (jwtRegex.test(clean)) {
    return {
      detectedType: 'jwt',
      confidence: 98,
      secondaryDetections: [{ type: 'base64', confidence: 85 }],
      summary: 'JWT (JSON Web Token) detected with header and signature parts.',
      recommendations: [
        { id: 'jwt-decode', label: 'Decode JWT & Inspect Claims', targetToolSlug: 'jwt-decoder', actionType: 'navigate' },
        { id: 'jwt-chain', label: 'Chain JWT → Format JSON → TypeScript', targetToolSlug: 'pipeline-builder', actionType: 'transform' },
        { id: 'jwt-ai', label: 'Explain JWT with AI', targetToolSlug: 'ai-assistant', actionType: 'ai' },
      ],
    };
  }

  // 2. JSON Detection
  if ((clean.startsWith('{') && clean.endsWith('}')) || (clean.startsWith('[') && clean.endsWith(']'))) {
    try {
      JSON.parse(clean);
      return {
        detectedType: 'json',
        confidence: 97,
        recommendations: [
          { id: 'json-format', label: 'Format & Validate JSON', targetToolSlug: 'json-formatter', actionType: 'navigate' },
          { id: 'json-ts', label: 'Generate TypeScript Interface', targetToolSlug: 'json-to-typescript', actionType: 'transform' },
          { id: 'json-zod', label: 'Generate Zod Schema', targetToolSlug: 'json-to-typescript', actionType: 'transform' },
          { id: 'json-chain', label: 'Create Pipeline (JSON → TS)', targetToolSlug: 'pipeline-builder', actionType: 'transform' },
        ],
        summary: 'Valid JSON object or array structure detected.',
      };
    } catch {
      // Near JSON syntax
    }
  }

  // 3. Error & Stack Trace Detection
  if (
    clean.includes('Error:') ||
    clean.includes('TypeError:') ||
    clean.includes('ReferenceError:') ||
    clean.includes('SyntaxError:') ||
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

  // 4. UUID Detection
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

  // 5. URL Detection
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('ftp://')) {
    return {
      detectedType: 'url',
      confidence: 96,
      recommendations: [
        { id: 'url-parse', label: 'Decode & Parse Query Parameters', targetToolSlug: 'url-encoder', actionType: 'navigate' },
        { id: 'url-qr', label: 'Generate QR Code for URL', targetToolSlug: 'qr-generator', actionType: 'transform' },
        { id: 'url-api', label: 'Test URL with API Tester', targetToolSlug: 'api-tester', actionType: 'navigate' },
      ],
      summary: 'HTTP / HTTPS Web URL detected.',
    };
  }

  // 6. SQL Query Detection
  if (/\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE)\b/i.test(clean)) {
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

  // 7. Unix Timestamp / ISO Date Detection
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

  // 8. Base64 Detection
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

  // Fallback Plain String
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

// -------------------------------------------------------------------------
// TOOL CHAINING & PIPELINE ENGINE
// -------------------------------------------------------------------------

export function validatePipeline(steps: PipelineStep[]): PipelineValidationResult {
  const errors: string[] = [];

  if (steps.length === 0) {
    return { valid: false, errors: ['Pipeline must contain at least 1 tool step.'] };
  }

  for (let i = 0; i < steps.length - 1; i++) {
    const current = steps[i];
    const next = steps[i + 1];

    // Check logical type compatibility
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
      if (step.toolSlug === 'jwt-decoder') {
        const decoded = decodeJwt(currentData);
        if (!decoded.success) {
          throw new Error(decoded.error || 'Failed to decode JWT token');
        }
        currentData = JSON.stringify(decoded.payload, null, 2);
      } else if (step.toolSlug === 'json-formatter') {
        const formatted = formatJson(currentData, { indent: 2 });
        if (!formatted.success) {
          throw new Error(formatted.error || 'Invalid JSON input');
        }
        currentData = formatted.result;
      } else if (step.toolSlug === 'json-to-typescript') {
        const obj = JSON.parse(currentData);
        currentData = `export interface GeneratedType {\n${Object.keys(obj)
          .map((k) => `  ${k}: ${typeof obj[k]};`)
          .join('\n')}\n}`;
      } else if (step.toolSlug === 'base64-encoder') {
        try {
          currentData = atob(currentData);
        } catch {
          currentData = btoa(currentData);
        }
      } else if (step.toolSlug === 'url-encoder') {
        currentData = decodeURIComponent(currentData);
      } else if (step.toolSlug === 'sql-formatter') {
        currentData = currentData
          .replace(/\s+/g, ' ')
          .replace(/\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/gi, '\n$1')
          .trim();
      }

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
