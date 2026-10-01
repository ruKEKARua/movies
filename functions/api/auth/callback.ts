import {
  AuthEnv,
  PagesFunctionContext,
  createCookie,
  createRandomValue,
  expiredCookie,
  getGoogleUser,
  getCookie,
  getOAuthConfig,
  redirectWithAuthError,
  requestGoogleToken,
  sessionCookieName,
  sessionTtlSeconds,
  stateCookieName,
} from '../../_shared/auth';

export const onRequestGet = async ({ request, env }: PagesFunctionContext) => {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const expectedState = getCookie(request, stateCookieName);
  const code = url.searchParams.get('code');

  if (!state || !expectedState || state !== expectedState || !code || url.searchParams.has('error')) {
    const response = redirectWithAuthError(request);
    response.headers.append('Set-Cookie', expiredCookie(stateCookieName));
    return response;
  }

  try {
    const { clientId, clientSecret, sessions } = getOAuthConfig(env as AuthEnv);
    const callbackUrl = new URL('/api/auth/callback', request.url).toString();
    const token = await requestGoogleToken({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    });

    if (!token.refresh_token) {
      throw new Error('Google did not return a refresh token');
    }

    const user = await getGoogleUser(token.access_token as string);
    const sessionId = createRandomValue();
    await sessions.put(sessionId, JSON.stringify({
      refreshToken: token.refresh_token,
      userName: user.name ?? user.email ?? 'Пользователь Google',
      userPicture: user.picture ?? '',
    }), { expirationTtl: sessionTtlSeconds });

    const headers = new Headers({
      Location: new URL('/', request.url).toString(),
      'Cache-Control': 'no-store',
    });
    headers.append('Set-Cookie', expiredCookie(stateCookieName));
    headers.append('Set-Cookie', createCookie(sessionCookieName, sessionId, sessionTtlSeconds));

    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error('Не удалось завершить вход Google:', error);
    const response = redirectWithAuthError(request);
    response.headers.append('Set-Cookie', expiredCookie(stateCookieName));
    return response;
  }
};