export interface JwtDecodeResult {
  success: boolean;
  header?: Record<string, any>;
  payload?: Record<string, any>;
  signature?: string;
  isExpired?: boolean;
  issuedAt?: string;
  expiresAt?: string;
  timeRemaining?: string;
  error?: string;
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return decodeURIComponent(
    atob(output)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function decodeJwt(token: string): JwtDecodeResult {
  const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
  if (!cleanToken) {
    return { success: false, error: 'Token string is empty.' };
  }

  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return {
      success: false,
      error: `Invalid JWT format. Expected 3 dot-separated parts, found ${parts.length}.`,
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);
    const signature = parts[2];

    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    let isExpired: boolean | undefined;
    let expiresAt: string | undefined;
    let timeRemaining: string | undefined;
    let issuedAt: string | undefined;

    if (payload.iat && typeof payload.iat === 'number') {
      issuedAt = new Date(payload.iat * 1000).toISOString();
    }

    if (payload.exp && typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000;
      const nowMs = Date.now();
      expiresAt = new Date(expMs).toISOString();
      isExpired = nowMs >= expMs;

      const diffSec = Math.floor((expMs - nowMs) / 1000);
      if (isExpired) {
        const pastSec = Math.abs(diffSec);
        const mins = Math.floor(pastSec / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) timeRemaining = `Expired ${days} day(s) ago`;
        else if (hours > 0) timeRemaining = `Expired ${hours} hour(s) ago`;
        else if (mins > 0) timeRemaining = `Expired ${mins} minute(s) ago`;
        else timeRemaining = `Expired ${pastSec} second(s) ago`;
      } else {
        const mins = Math.floor(diffSec / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) timeRemaining = `${days} day(s) remaining`;
        else if (hours > 0) timeRemaining = `${hours} hour(s) remaining`;
        else if (mins > 0) timeRemaining = `${mins} minute(s) remaining`;
        else timeRemaining = `${diffSec} second(s) remaining`;
      }
    }

    return {
      success: true,
      header,
      payload,
      signature,
      isExpired,
      issuedAt,
      expiresAt,
      timeRemaining,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to decode base64 JWT parts.',
    };
  }
}
