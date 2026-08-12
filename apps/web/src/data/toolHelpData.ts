export interface ToolExample {
  title: string;
  input: string;
  output: string;
  description?: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolHelpInfo {
  toolSlug: string;
  overview: string;
  steps: string[];
  features: string[];
  examples: ToolExample[];
  proTips: string[];
  faq: ToolFaq[];
}

export const TOOL_HELP_DATA: Record<string, ToolHelpInfo> = {
  'json-formatter': {
    toolSlug: 'json-formatter',
    overview: 'Format, validate, minifying, and sort keys in JSON documents instantly in your browser.',
    steps: [
      'Paste your raw JSON string or object into the input text area.',
      'Select your desired indentation spacing (2 spaces or 4 spaces) or check "Sort Keys".',
      'Click "Format JSON" to beautify or "Minify JSON" to compress the output.',
      'Use "Copy Output" or "Download" to save the processed JSON result.',
    ],
    features: [
      'Syntax Validation with line-by-line error reporting.',
      'Key Sorting to standardize object keys for git diff comparison.',
      'AI Error Explainer to automatically diagnose malformed JSON syntax.',
      '100% Client-side processing — no JSON data is sent to external servers.',
    ],
    examples: [
      {
        title: 'Unformatted / Compact JSON to Formatted',
        input: '{"name":"DevKit","version":1,"active":true}',
        output: '{\n  "active": true,\n  "name": "DevKit",\n  "version": 1\n}',
        description: 'Formatted with 2-space indentation and sorted object keys.',
      },
    ],
    proTips: [
      'Checking "Sort Keys" helps maintain consistent JSON structures across team commits.',
      'If formatting fails due to a missing comma or quote, click "Explain Error with AI" for an instant fix suggestion.',
    ],
    faq: [
      {
        question: 'Is my JSON data safe when formatting here?',
        answer: 'Yes! All formatting, validation, and minification operations execute locally in your web browser using JavaScript.',
      },
      {
        question: 'What is the maximum JSON file size supported?',
        answer: 'Since processing is done client-side in memory, DevKit can easily handle JSON files up to several megabytes.',
      },
    ],
  },

  'json-to-typescript': {
    toolSlug: 'json-to-typescript',
    overview: 'Convert raw JSON objects into TypeScript interfaces, Zod validation schemas, Go structs, or Python dataclasses.',
    steps: [
      'Paste a representative JSON object payload into the left input pane.',
      'Select your target output language (TypeScript, Zod, Go, or Python).',
      'Customize the Root Struct/Interface Name (default: "UserProfile").',
      'Click "Generate Code" or use the top AI Assistant banner to describe target types in natural language.',
    ],
    features: [
      'Automatic type inference for nested objects, arrays, booleans, and nullables.',
      'Supports TypeScript `interface`, Zod `z.object()`, Go `type Struct`, and Python `@dataclass`.',
      'Embedded AI Assistant for prompt-based type generation.',
    ],
    examples: [
      {
        title: 'JSON → TypeScript Interface',
        input: '{\n  "id": 101,\n  "username": "alex",\n  "tags": ["dev", "admin"]\n}',
        output: 'export interface UserProfile {\n  id: number;\n  username: string;\n  tags: string[];\n}',
        description: 'Infers primitives and string array types automatically.',
      },
    ],
    proTips: [
      'Ensure your JSON input contains representative data values so array element types can be correctly inferred.',
      'Use the AI banner at the top if you want to generate schemas from natural language descriptions.',
    ],
    faq: [
      {
        question: 'Does this handle nested objects?',
        answer: 'Yes, nested objects will generate separate child interface/struct definitions automatically.',
      },
    ],
  },

  'jwt-decoder': {
    toolSlug: 'jwt-decoder',
    overview: 'Decode and inspect JSON Web Tokens (JWT) safely on your local client without exposing secret keys.',
    steps: [
      'Paste your Bearer token or raw JWT string (e.g. `eyJhbGci...`).',
      'DevKit instantly decodes the Header, Payload, and Signature components.',
      'Inspect claims such as Issuer (`iss`), Expiration (`exp`), Subject (`sub`), and Issued At (`iat`).',
      'View real-time token validity status (Active vs Expired).',
    ],
    features: [
      'Instant client-side base64url decoding.',
      'Expiration timestamp parser with relative time status.',
      'Automatic redaction safeguard prevents tokens from being saved in public logs by default.',
    ],
    examples: [
      {
        title: 'Decoded JWT Payload Example',
        input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        output: '{\n  "sub": "usr_9912",\n  "email": "dev@devkit.app",\n  "exp": 1770000000\n}',
        description: 'Decodes header and payload JSON objects cleanly.',
      },
    ],
    proTips: [
      'Click "Explain JWT with AI" in the Smart Context Panel for a breakdown of unknown claim keys.',
    ],
    faq: [
      {
        question: 'Is my secret key or private token sent to a server?',
        answer: 'Never. JWT decoding is performed entirely in your browser using standard base64 decoding.',
      },
    ],
  },

  'uuid-generator': {
    toolSlug: 'uuid-generator',
    overview: 'Generate bulk cryptographically secure v4 (random) and v7 (time-ordered) UUIDs.',
    steps: [
      'Select UUID version: v4 (random) or v7 (timestamp-ordered).',
      'Enter the quantity of UUIDs to generate (from 1 to 100).',
      'Choose formatting options: Uppercase, Hyphens, or Braces.',
      'Click "Generate UUIDs" and copy individually or all at once.',
    ],
    features: [
      'Uses Web Crypto API `crypto.getRandomValues()` for high entropy.',
      'UUID v7 support for timestamp-sorted database keys.',
      'Bulk generation with one-click copy all.',
    ],
    examples: [
      {
        title: 'UUID v4 Format',
        input: 'Quantity: 1 (v4)',
        output: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        description: 'Standard 36-character hyphenated UUID v4 string.',
      },
    ],
    proTips: [
      'Use UUID v7 when inserting bulk rows into B-tree indexed databases (like PostgreSQL or MySQL) to reduce page splits.',
    ],
    faq: [
      {
        question: 'Are generated UUIDs unique?',
        answer: 'Yes, UUID v4 and v7 have virtually zero probability of collision due to 122 bits of cryptographic randomness.',
      },
    ],
  },

  'base64-encoder': {
    toolSlug: 'base64-encoder',
    overview: 'Encode and decode standard and URL-safe Base64 strings client-side.',
    steps: [
      'Enter or paste your text content in the input area.',
      'Click "Encode to Base64" or "Decode from Base64".',
      'Toggle "URL Safe Mode" if encoding string for query parameters or web URLs.',
      'Copy the output string to clipboard.',
    ],
    features: [
      'Standard Base64 (RFC 4648) and URL-safe Base64 (`-` and `_`).',
      'UTF-8 multibyte character encoding support.',
      'Instant client-side execution.',
    ],
    examples: [
      {
        title: 'Text to Base64',
        input: 'DevKit Toolbox 2026',
        output: 'RGV2S2l0IFRvb2xib3ggMjAyNg==',
      },
    ],
    proTips: [
      'URL-safe Base64 replaces `+` with `-` and `/` with `_`, stripping trailing `=` padding for clean URL parameters.',
    ],
    faq: [
      {
        question: 'Does Base64 encrypt my data?',
        answer: 'No! Base64 is an encoding format, not encryption. Anyone can decode a Base64 string back to original text.',
      },
    ],
  },

  'url-encoder': {
    toolSlug: 'url-encoder',
    overview: 'Encode, decode, and parse query parameters from URLs and URI components.',
    steps: [
      'Paste a full URL or raw query string in the input field.',
      'Click "URL Encode" or "URL Decode".',
      'View parsed query parameters in the interactive key-value table below.',
    ],
    features: [
      'Percent-encoding for special characters (`?`, `&`, `=`, `#`, spaces).',
      'Interactive Query Parameter table with individual copy buttons.',
      'Supports full URL parsing and raw component encoding.',
    ],
    examples: [
      {
        title: 'URL Percent Encoding',
        input: 'https://devkit.app/search?q=hello world & code=100%',
        output: 'https%3A%2F%2Fdevkit.app%2Fsearch%3Fq%3Dhello%20world%20%26%20code%3D100%25',
      },
    ],
    proTips: [
      'Use URL decode to quickly inspect complex tracking links or OAuth redirect query parameters.',
    ],
    faq: [
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer: 'encodeURI preserves URL structure characters like `?` and `/`, whereas encodeURIComponent encodes all special characters.',
      },
    ],
  },

  'timestamp-converter': {
    toolSlug: 'timestamp-converter',
    overview: 'Convert Unix epoch timestamps to human-readable dates and vice-versa.',
    steps: [
      'Enter Unix timestamp digits in seconds or milliseconds, or select a date/time picker.',
      'View instant conversions to UTC, Local Time, ISO 8601, and relative duration.',
      'Click "Now" to fetch current system timestamp.',
    ],
    features: [
      'Auto-detects seconds (10 digits) vs milliseconds (13 digits).',
      'Displays Local Timezone, UTC / GMT, and ISO 8601 strings.',
      'Relative time calculation (e.g. "in 3 hours" or "5 days ago").',
    ],
    examples: [
      {
        title: 'Timestamp to ISO Date',
        input: '1770000000',
        output: '2026-02-02T02:40:00.000Z',
      },
    ],
    proTips: [
      'Most APIs (Unix) use 10-digit seconds, while JavaScript `Date.now()` uses 13-digit milliseconds.',
    ],
    faq: [
      {
        question: 'What is Unix Epoch time?',
        answer: 'Unix epoch time is the total number of seconds elapsed since January 1, 1970 00:00:00 UTC.',
      },
    ],
  },

  'hash-generator': {
    toolSlug: 'hash-generator',
    overview: 'Compute MD5, SHA-1, SHA-256, and SHA-512 cryptographic digests client-side.',
    steps: [
      'Type or paste string content into the input field.',
      'Hashes update automatically in real-time as you type.',
      'Copy your desired hash digest with one click.',
    ],
    features: [
      'Supports MD5, SHA-1, SHA-256, and SHA-512 algorithms.',
      'Web Crypto API hardware-accelerated processing.',
      'Zero network latency — 100% client-side.',
    ],
    examples: [
      {
        title: 'SHA-256 Digest',
        input: 'devkit',
        output: '8fa37d3e64c2438865e18230ef1d21469e38d76a2b8e3926e84cfb7d43231362',
      },
    ],
    proTips: [
      'Use SHA-256 or SHA-512 for security applications. MD5 and SHA-1 should only be used for legacy checksum verification.',
    ],
    faq: [
      {
        question: 'Can a hash be reversed back to original text?',
        answer: 'No, cryptographic hash functions are one-way mathematical functions.',
      },
    ],
  },

  'regex-tester': {
    toolSlug: 'regex-tester',
    overview: 'Test regular expressions against sample text with real-time match highlighting, group capture, and AI generation.',
    steps: [
      'Enter Regex pattern in the pattern input (without slashes).',
      'Select flags (`g` global, `i` case insensitive, `m` multiline).',
      'Paste test text to see matching highlights and capture group breakdowns.',
      'Or describe the pattern in natural language in the AI Assistant banner to auto-generate regex.',
    ],
    features: [
      'Real-time match count and syntax error diagnostics.',
      'Color-coded capture groups table.',
      'AI Assistant banner powered by Groq LLM for natural language pattern generation.',
    ],
    examples: [
      {
        title: 'Email Address Matcher',
        input: 'Pattern: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        output: 'Matches "support@devkit.app" and "admin@company.io"',
      },
    ],
    proTips: [
      'Hover over matched pills in the test string area to inspect capture group indices.',
    ],
    faq: [
      {
        question: 'What JavaScript Regex engine is used?',
        answer: 'DevKit uses the standard native ECMAScript RegExp engine in your browser.',
      },
    ],
  },

  'sql-formatter': {
    toolSlug: 'sql-formatter',
    overview: 'Format, clean, and beautify raw SQL queries with custom dialect syntax.',
    steps: [
      'Paste raw unformatted SQL into the input editor.',
      'Select database dialect (PostgreSQL, MySQL, SQLite).',
      'Click "Format SQL" to beautify or "Minify" to compress.',
      'Use AI Assistant banner to generate SQL queries from natural language.',
    ],
    features: [
      'Keyword uppercase formatting (`SELECT`, `FROM`, `WHERE`, `JOIN`).',
      'Dialect-specific syntax handling.',
      'AI SQL Generator for prompt-based query generation.',
    ],
    examples: [
      {
        title: 'Unformatted SQL to Formatted',
        input: 'select id, name from users where active=1 order by name ascii',
        output: 'SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  name ASC;',
      },
    ],
    proTips: [
      'Consistent SQL formatting improves code review readability and database query auditing.',
    ],
    faq: [
      {
        question: 'Will this execute my SQL queries on a database?',
        answer: 'No! This tool only formats, formats, or generates SQL text strings.',
      },
    ],
  },

  'api-tester': {
    toolSlug: 'api-tester',
    overview: 'Lightweight REST API tester to send HTTP requests, configure headers, body payloads, and inspect status codes.',
    steps: [
      'Select HTTP Method (GET, POST, PUT, PATCH, DELETE).',
      'Enter request URL endpoint.',
      'Add Request Headers, Query Parameters, or JSON Request Body.',
      'Click "Send Request" to view status code, response time, headers, and formatted JSON body.',
    ],
    features: [
      'Response timing and status code badges (200 OK, 404, 500).',
      'Built-in SSRF protection and client-side browser fetch option.',
      'Save and share request configurations.',
    ],
    examples: [
      {
        title: 'GET Request Example',
        input: 'GET https://jsonplaceholder.typicode.com/todos/1',
        output: 'Status: 200 OK — Response Body JSON formatted',
      },
    ],
    proTips: [
      'If testing local API endpoints with CORS issues, ensure your local backend enables `Access-Control-Allow-Origin`.',
    ],
    faq: [
      {
        question: 'Are authorization headers saved to cloud history?',
        answer: 'No, DevKit automatically redacts Bearer tokens and sensitive API keys before persisting history.',
      },
    ],
  },

  'pipeline-builder': {
    toolSlug: 'pipeline-builder',
    overview: 'Chain multiple developer tools together to create automated, reusable data processing pipelines.',
    steps: [
      'Enter your initial raw input data.',
      'Add steps sequentially (e.g. JWT Decoder → JSON Formatter → TypeScript Generator).',
      'Click "Run Pipeline" to execute all steps in sequence.',
      'Inspect intermediate results at each step or copy final output.',
    ],
    features: [
      'Logical input/output type validation between steps.',
      'Step re-ordering and step removal controls.',
      'Supports Build Workflow integration from Smart Context Panel.',
    ],
    examples: [
      {
        title: 'JWT → TS Interface Pipeline',
        input: 'eyJhbGci...',
        output: 'Step 1: Decode JWT -> Step 2: Format JSON -> Step 3: Generate TypeScript',
      },
    ],
    proTips: [
      'Save frequently used pipelines to your workspace for instant one-click execution later.',
    ],
    faq: [
      {
        question: 'What happens if a step in the pipeline fails?',
        answer: 'Execution halts at the failing step and displays an error message explaining the incompatible data format.',
      },
    ],
  },

  'ai-assistant': {
    toolSlug: 'ai-assistant',
    overview: 'Multi-functional AI suite powered by Groq LLM featuring Regex Generator, SQL Generator, Error Explainer, Code Explainer, and JSON Converter.',
    steps: [
      'Select active AI mode tab: Regex, SQL, Error Explainer, Code Explainer, or JSON Converter.',
      'Enter natural language description, code snippet, or error stack trace.',
      'Click "Generate" to trigger AI analysis.',
      'Review generated code, root cause explanation, likely fixes, and test examples.',
    ],
    features: [
      'Powered by Groq `llama-3.3-70b-versatile` high-speed LLM.',
      'Contextual pre-fill integration from Smart Context Panel.',
      'Structured JSON response rendering with code block copy buttons.',
    ],
    examples: [
      {
        title: 'Error Explainer Prompt',
        input: 'TypeError: Cannot read properties of undefined (reading "map")',
        output: 'Root Cause: Accessing .map() on undefined variable -> Fix: Add optional chaining or null check.',
      },
    ],
    proTips: [
      'Include line numbers or code snippet context in Error Explainer for higher accuracy fix suggestions.',
    ],
    faq: [
      {
        question: 'Is there a rate limit for AI usage?',
        answer: 'Yes, AI endpoints are rate limited to 10 requests per minute per IP to ensure server stability.',
      },
    ],
  },

  'cron-builder': {
    toolSlug: 'cron-builder',
    overview: 'Construct 5-field cron expressions with human-readable schedule explanations and execution previews.',
    steps: [
      'Toggle minute, hour, day of month, month, and day of week options.',
      'Or type a raw 5-field cron string in the input field.',
      'View human-readable schedule description (e.g. "Every 15 minutes, every day").',
      'View calculated upcoming execution timestamps.',
    ],
    features: [
      'Standard 5-field crontab syntax parser.',
      'Human-friendly natural language translations.',
      'Next 5 execution forecast timestamps.',
    ],
    examples: [
      {
        title: 'Every 15 Minutes',
        input: '*/15 * * * *',
        output: 'At every 15th minute.',
      },
    ],
    proTips: [
      'Use `0 0 * * *` for daily midnight tasks or `0 9 * * 1` for weekly Monday 9 AM reports.',
    ],
    faq: [
      {
        question: 'Does this support 6-field cron expressions with seconds?',
        answer: 'DevKit standardizes on standard 5-field Unix crontab expressions (`minute hour day-of-month month day-of-week`).',
      },
    ],
  },

  'qr-generator': {
    toolSlug: 'qr-generator',
    overview: 'Generate customizable vector QR codes from URLs, text, or credentials with instant SVG and PNG download.',
    steps: [
      'Enter URL or text string in the input field.',
      'Customize QR code size, margin, foreground color, and background color.',
      'Download high-resolution PNG or vector SVG file.',
    ],
    features: [
      'High-definition SVG and PNG export.',
      'Custom color pickers for dark/light themes.',
      'Instant client-side QR matrix rendering.',
    ],
    examples: [
      {
        title: 'URL QR Code',
        input: 'https://devkit.app',
        output: 'Downloadable QR Code Image',
      },
    ],
    proTips: [
      'Ensure high contrast between foreground and background colors so phone cameras can scan easily.',
    ],
    faq: [
      {
        question: 'Do generated QR codes expire?',
        answer: 'No! The QR code encodes your data directly into the visual pattern, so it works forever.',
      },
    ],
  },

  'color-converter': {
    toolSlug: 'color-converter',
    overview: 'Convert color values between HEX, RGB, HSL, HSV, OKLCH and check WCAG contrast accessibility ratios.',
    steps: [
      'Type a color string in HEX, RGB, or HSL format or pick with the color picker.',
      'View instant conversion into all major color spaces including OKLCH.',
      'Test text and background contrast against WCAG 2.1 AA and AAA accessibility standards.',
    ],
    features: [
      'Supports HEX, RGB, HSL, HSV, and OKLCH color spaces.',
      'WCAG 2.1 contrast ratio calculator (AA / AAA compliance).',
      'One-click color code copy.',
    ],
    examples: [
      {
        title: 'HEX to RGB & HSL',
        input: '#8B5CF6',
        output: 'RGB: rgb(139, 92, 246) | HSL: hsl(259, 90%, 66%) | OKLCH: oklch(0.62 0.22 291)',
      },
    ],
    proTips: [
      'Ensure a contrast ratio of at least 4.5:1 for normal body text to pass WCAG AA accessibility standards.',
    ],
    faq: [
      {
        question: 'Why use OKLCH color space?',
        answer: 'OKLCH is perceptually uniform, making color gradients and palette generation look much more natural than HSL.',
      },
    ],
  },
};

export function getToolHelp(slug: string): ToolHelpInfo | undefined {
  return TOOL_HELP_DATA[slug];
}
