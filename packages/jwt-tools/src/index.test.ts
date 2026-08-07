import { describe, it, expect } from 'vitest';
import { decodeJwt } from './index';

describe('JWT Tools Package', () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.40P_t-35d21xL-1zG1vJ8Q';

  it('decodes JWT header and payload correctly', () => {
    const res = decodeJwt(token);
    expect(res.success).toBe(true);
    expect(res.header?.alg).toBe('HS256');
    expect(res.payload?.name).toBe('John Doe');
    expect(res.isExpired).toBe(false);
  });

  it('returns explicit error for invalid token formats', () => {
    const res = decodeJwt('invalid-token-string');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
