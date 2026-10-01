import {
  AuthEnv,
  PagesFunctionContext,
  expiredCookie,
  getOAuthConfig,
  getStoredSession,
  jsonResponse,
  sessionCookieName,
} from '../_shared/auth';

export const onRequestPost = async ({ request, env }: PagesFunctionContext) => {
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return jsonResponse({ error: 'invalid_origin' }, 403);
  }

  const stored = await getStoredSession(request, env as AuthEnv);
  if (stored) {
    const { sessions } = getOAuthConfig(env as AuthEnv);
    await sessions.delete(stored.sessionId);
  }

  return jsonResponse({ ok: true }, 200, {
    'Set-Cookie': expiredCookie(sessionCookieName),
  });
};