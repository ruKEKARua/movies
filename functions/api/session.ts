import {
  AuthEnv,
  PagesFunctionContext,
  createCookie,
  expiredCookie,
  getOAuthConfig,
  getStoredSession,
  jsonResponse,
  refreshGoogleAccessToken,
  sessionCookieName,
  sessionTtlSeconds,
} from '../_shared/auth';

type GoogleSheetsResponse = {
  values?: string[][];
};

const spreadsheetId = '1DD6U6fawOirU61-ZuP4GYpoK2p2eLUV2PbJe26uB7A8';

async function fetchRange(accessToken: string, range: string, majorDimension: 'ROWS' | 'COLUMNS' = 'COLUMNS') {
  const query = new URLSearchParams({ majorDimension: majorDimension.toLowerCase() });
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?${query}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error('Не удалось загрузить данные Google Sheets');
  }

  return await response.json() as GoogleSheetsResponse;
}

export const onRequestGet = async ({ request, env }: PagesFunctionContext) => {
  const stored = await getStoredSession(request, env as AuthEnv);
  if (!stored) {
    return jsonResponse({ error: 'not_authenticated' }, 401, {
      'Set-Cookie': expiredCookie(sessionCookieName),
    });
  }

  try {
    const { sessions } = getOAuthConfig(env as AuthEnv);
    const accessToken = await refreshGoogleAccessToken(stored.session.refreshToken, env as AuthEnv);
    const [moviesResponse, ratingsResponse, participantsResponse] = await Promise.all([
      fetchRange(accessToken, 'Киноклуб!C5:C'),
      fetchRange(accessToken, 'Киноклуб!B5:F', 'ROWS'),
      fetchRange(accessToken, 'Сводная киноклуба!B3:B50'),
    ]);

    await sessions.put(stored.sessionId, JSON.stringify(stored.session), {
      expirationTtl: sessionTtlSeconds,
    });

    return jsonResponse({
      userName: stored.session.userName,
      userPicture: stored.session.userPicture,
      movies: moviesResponse.values?.[0] ?? [],
      ratings: ratingsResponse.values ?? [],
      participants: participantsResponse.values?.[0] ?? [],
    }, 200, {
      'Set-Cookie': createCookie(sessionCookieName, stored.sessionId, sessionTtlSeconds),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      const { sessions } = getOAuthConfig(env as AuthEnv);
      await sessions.delete(stored.sessionId);
      return jsonResponse({ error: 'session_expired' }, 401, {
        'Set-Cookie': expiredCookie(sessionCookieName),
      });
    }

    console.error('Не удалось обновить сессию Google:', error);
    return jsonResponse({ error: 'google_request_failed' }, 502);
  }
};