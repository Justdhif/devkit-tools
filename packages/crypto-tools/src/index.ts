// UUID Generator (v4 & v7)
export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateUuidV7(): string {
  const timestamp = Date.now();
  const hexTimestamp = timestamp.toString(16).padStart(12, '0');
  const randA = Math.floor(Math.random() * 0x0fff).toString(16).padStart(3, '0');
  const randB = Math.floor(Math.random() * 0x3fff | 0x8000).toString(16).padStart(4, '0');
  const randC = Array.from({ length: 3 }, () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')).join('');

  return `${hexTimestamp.slice(0, 8)}-${hexTimestamp.slice(8, 12)}-7${randA}-${randB}-${randC}`;
}

export function generateBulkUuids(count: number = 5, version: 'v4' | 'v7' = 'v4'): string[] {
  const safeCount = Math.min(Math.max(1, count), 500);
  const generator = version === 'v7' ? generateUuidV7 : generateUuidV4;
  return Array.from({ length: safeCount }, () => generator());
}

// Base64 Encoder / Decoder
export function encodeBase64(input: string, urlSafe: boolean = false): string {
  if (!input) return '';
  try {
    const encoded = btoa(
      encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    if (urlSafe) {
      return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return encoded;
  } catch (err: any) {
    throw new Error('Base64 encoding failed: ' + err.message);
  }
}

export function decodeBase64(input: string): string {
  if (!input) return '';
  try {
    let normalized = input.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
    const decodedBinary = atob(normalized);
    return decodeURIComponent(
      decodedBinary
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (err: any) {
    throw new Error('Invalid Base64 string format.');
  }
}

// URL Encoder / Decoder
export function encodeUrl(input: string, componentMode: boolean = true): string {
  if (!input) return '';
  return componentMode ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrl(input: string, componentMode: boolean = true): string {
  if (!input) return '';
  try {
    return componentMode ? decodeURIComponent(input) : decodeURI(input);
  } catch (err: any) {
    throw new Error('Invalid URL percent-encoded sequence.');
  }
}

export function parseQueryParams(urlOrQuery: string): Record<string, string> {
  const result: Record<string, string> = {};
  let queryString = urlOrQuery.trim();

  if (queryString.includes('?')) {
    queryString = queryString.split('?')[1] || '';
  }

  if (!queryString) return result;

  const params = new URLSearchParams(queryString);
  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

// Unix Timestamp Converter
export interface TimestampParseResult {
  iso: string;
  utc: string;
  local: string;
  unixSeconds: number;
  unixMilliseconds: number;
}

export function parseTimestamp(input: string | number): TimestampParseResult | null {
  let date: Date;

  if (typeof input === 'number' || !isNaN(Number(input))) {
    const num = Number(input);
    // Determine if seconds or milliseconds
    const isSeconds = num < 10000000000;
    date = new Date(isSeconds ? num * 1000 : num);
  } else {
    date = new Date(String(input));
  }

  if (isNaN(date.getTime())) return null;

  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
  };
}

// Client-side Cryptographic Hash Algorithms (Web Crypto API fallback / SHA/MD5)
export async function computeHash(input: string, algorithm: 'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5'): Promise<string> {
  if (!input) return '';

  if (algorithm === 'MD5') {
    return md5(input);
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  return `[Web Crypto API unavailable for ${algorithm}]`;
}

// Pure JS MD5 implementation for client-side privacy without dependencies
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17,  606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12,  1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7,  1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7,  1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22,  1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14,  643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9,  38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5,  568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20,  1163531501);
    a = gg(a, b, c, d, k[13], 5, -144468057);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14,  1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16,  1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11,  1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4,  681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23,  76029189);
    a = hh(a, b, c, d, k[9], 4, -640364409);
    d = hh(d, a, b, c, k[12], 11, -343485551);
    c = hh(c, d, a, b, k[15], 16,  417764999);
    b = hh(b, c, d, a, k[2], 23, -1016307567);

    a = ii(a, b, c, d, k[0], 6, -426435558);
    d = ii(d, a, b, c, k[7], 10,  432230130);
    c = ii(c, d, a, b, k[14], 15, -1120210379);
    b = ii(b, c, d, a, k[5], 21, -343485551);
    a = ii(a, b, c, d, k[12], 6, -51403784);
    d = ii(d, a, b, c, k[3], 10,  1735328473);
    c = ii(c, d, a, b, k[10], 15, -1926607734);
    b = ii(b, c, d, a, k[1], 21, -378558);
    a = ii(a, b, c, d, k[8], 6, -2022574463);
    d = ii(d, a, b, c, k[15], 10,  1839030562);
    c = ii(c, d, a, b, k[6], 15, -35309556);
    b = ii(b, c, d, a, k[13], 21, -1530992060);

    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

  function add32(x: number, y: number) {
    return (x + y) & 0xFFFFFFFF;
  }

  function md51(s: string) {
    const txt = unescape(encodeURIComponent(s));
    const n = txt.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(txt.substring(i - 64, i)));
    }
    const tail = txt.substring(i - 64);
    const blk = new Array(16).fill(0);
    for (i = 0; i < tail.length; i++) blk[i >> 2] |= tail.charCodeAt(i) << ((i % 4) << 3);
    blk[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, blk);
      blk.fill(0);
    }
    blk[14] = n * 8;
    md5cycle(state, blk);
    return state;
  }

  function md5blk(s: string) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  const hexTab = '0123456789abcdef';
  function rhex(n: number) {
    let s = '';
    for (let j = 0; j < 4; j++) {
      s += hexTab.charAt((n >> (j * 8 + 4)) & 0x0F) + hexTab.charAt((n >> (j * 8)) & 0x0F);
    }
    return s;
  }

  const res = md51(string);
  return rhex(res[0]) + rhex(res[1]) + rhex(res[2]) + rhex(res[3]);
}
