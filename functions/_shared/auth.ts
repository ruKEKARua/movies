export type SessionStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

export type AuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  AUTH_SESSIONS?: SessionStore;
};

export type PagesFunctionContext = {
  request: Request;
  env: AuthEnv;
};

export type GoogleSession = {
  refreshToken: string;
  userName: string;
  userPicture: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
};

export const sessionCookieName = '__Host-movie-session';
export const stateCookieName = '__Host-movie-oauth-state';
export const sessionTtlSeconds = 30 * 24 * 60 * 60;

export const getCookie = (request: Request, name: string) => request.headers.get('Cookie')
  ?.split(';')
  .map((cookie) => cookie.trim())
  .find((cookie) => cookie.startsWith(`${name}=`))
  ?.slice(name.length + 1);

export const createCookie = (name: string, value: string, maxAge: number) =>
  `${name}=${value}; Max-Age=${maxAge}; Path=/; Secure; HttpOnly; SameSite=Lax`;

export const expiredCookie = (name: string) =>
  `${name}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax`;

export const createRandomValue = (byteLength = 32) => {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const redirectWithAuthError = (request: Request, reason = 'google_oauth') => {
  const errorUrl = new URL('/', request.url);
  errorUrl.searchParams.set('auth_error', reason);
  return Response.redirect(errorUrl, 302);
};

export const getOAuthConfig = (env: AuthEnv) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.AUTH_SESSIONS) {
    throw new Error('Google OAuth is not configured');
  }

  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    sessions: env.AUTH_SESSIONS,
  };
};

export async function requestGoogleToken(parameters: Record<string, string>) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(parameters),
  });
  const token = await response.json() as GoogleTokenResponse;

  if (!response.ok || !token.access_token) {
    throw new Error(token.error ?? 'Google token request failed');
  }

  return token;
}

export async function getGoogleUser(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Google user information request failed');
  }

  return await response.json() as { name?: string; email?: string; picture?: string };
}

export async function getStoredSession(request: Request, env: AuthEnv) {
  const sessionId = getCookie(request, sessionCookieName);
  if (!sessionId || !/^[a-f0-9]{64}$/.test(sessionId)) {
    return null;
  }

  const { sessions } = getOAuthConfig(env);

  const value = await sessions.get(sessionId);
  if (!value) {
    return null;
  }

  try {
    return {
      sessionId,
      session: JSON.parse(value) as GoogleSession,
    };
  } catch {
    await sessions.delete(sessionId);
    return null;
  }
}

export async function refreshGoogleAccessToken(refreshToken: string, env: AuthEnv) {
  const { clientId, clientSecret } = getOAuthConfig(env);
  const token = await requestGoogleToken({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  return token.access_token as string;
}

export function jsonResponse(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}