/**
 * Auth Helpers — Token management and session utilities.
 */

const ACCESS_TOKEN_KEY = 'utsukushii_access_token';
const REFRESH_TOKEN_KEY = 'utsukushii_refresh_token';

// ── Token Storage ─────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ── JWT Utilities ─────────────────────────────────────────────────────

interface JWTPayload {
  sub: string;
  email?: string;
  exp: number;
  iat: number;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  // Add 30s buffer to account for clock skew
  const now = Date.now() / 1000;
  return payload.exp < now + 30;
}

export function getTokenExpiresIn(token: string): number {
  const payload = decodeToken(token);
  if (!payload) return 0;
  return Math.max(0, payload.exp - Date.now() / 1000);
}

// ── Auth Headers ──────────────────────────────────────────────────────

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ── Session Check ─────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}
