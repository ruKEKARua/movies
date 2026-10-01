import {
  AuthEnv,
  PagesFunctionContext,
  createCookie,
  createRandomValue,
  getOAuthConfig,
  stateCookieName,
} from '../../_shared/auth';

export const onRequestGet = async ({ request, env }: PagesFunctionContext) => {
  try {
    const { clientId } = getOAuthConfig(env as AuthEnv);
    const state = createRandomValue();
    const callbackUrl = new URL('/api/auth/callback', request.url).toString();
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authorizationUrl.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid profile email https://www.googleapis.com/auth/spreadsheets',
      access_type: 'offline',
      prompt: 'consent',
      state,
    }).toString();

    return new Response(null, {
      status: 302,
      headers: {
        Location: authorizationUrl.toString(),
        'Set-Cookie': createCookie(stateCookieName, state, 600),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Не удалось начать вход Google:', error);
    return Response.redirect(new URL('/?auth_error=google_oauth', request.url), 302);
  }
};