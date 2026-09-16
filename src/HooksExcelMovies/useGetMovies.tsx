import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setExcelMovies } from '../store/excelMovies';
import { appendMovieToSheet, type MovieSheetEntry } from '../api/googleSheets';

type GoogleSheetsResponse = {
    values?: string[][];
};

type GoogleUserResponse = {
    name?: string;
    email?: string;
    picture?: string;
};

export type MovieRating = {
    userName: string;
    scores: string[];
};

export type MovieRatings = {
    movie: string;
    date?: string;
    ratings: MovieRating[];
};

const parseMovieRatings = (rows: string[][]): MovieRatings[] => {
    const movies: MovieRatings[] = [];
    let currentMovie: MovieRatings | null = null;

    for (const row of rows) {
        if (row.length === 0) {
            if (currentMovie) {
                movies.push(currentMovie);
                currentMovie = null;
            }
            continue;
        }

        const values = row.filter((value) => value !== '' && value !== '2025' && value !== '2026');
        if (values.length === 0) {
            continue;
        }

        const isMovieHeader = /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(String(values[0] ?? ''))
            || /^\d{4}[./-]\d{1,2}[./-]\d{1,2}$/.test(String(values[0] ?? ''));

        if (isMovieHeader) {
            const [date, movieName, userName, ...scores] = values;

            if (!currentMovie || currentMovie.movie !== movieName) {
                if (currentMovie) {
                    movies.push(currentMovie);
                }

                currentMovie = {
                    movie: movieName,
                    date,
                    ratings: [],
                };
            }

            if (userName) {
                currentMovie.ratings.push({
                    userName,
                    scores: scores.filter(Boolean),
                });
            }

            continue;
        }

        const [movieOrUser, userOrScore, ...scores] = values;

        if (!currentMovie) {
            currentMovie = {
                movie: movieOrUser,
                ratings: userOrScore
                    ? [{ userName: userOrScore, scores }]
                    : [],
            };
        } else {
            currentMovie.ratings.push({
                userName: movieOrUser,
                scores: [userOrScore, ...scores].filter(Boolean),
            });
        }
    }

    if (currentMovie) {
        movies.push(currentMovie);
    }

    return movies;
};

const useGetMovies = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState<string[]>([]);
    const [usersRating, setUsersRating] = useState<MovieRatings[]>([]);
    const [participantNames, setParticipantNames] = useState<string[]>([]);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userPicture, setUserPicture] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const login = useGoogleLogin({
        scope: 'openid profile email https://www.googleapis.com/auth/spreadsheets',

        onSuccess: async ({ access_token }) => {
            setAccessToken(access_token);
            setIsAuthorized(true);
            setIsLoading(true);

            try {
                const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });

                if (userResponse.ok) {
                    const user = await userResponse.json() as GoogleUserResponse;
                    setUserName(user.name ?? user.email ?? 'Пользователь Google');
                    setUserPicture(user.picture ?? '');
                }
            } catch (error) {
                console.error('Не удалось получить данные пользователя Google:', error);
            }

            const spreadsheetId = '1DD6U6fawOirU61-ZuP4GYpoK2p2eLUV2PbJe26uB7A8';

            const fetchRange = async (
                range: string,
                majorDimension: 'ROWS' | 'COLUMNS' = 'COLUMNS',
            ): Promise<GoogleSheetsResponse> => {
                const encodedRange = encodeURIComponent(range);
                const response = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?majorDimension=${majorDimension.toLowerCase()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные Google Sheets');
                }

                return response.json() as Promise<GoogleSheetsResponse>;
            };

            try {
                const [moviesResponse, ratingsResponse, participantsResponse] = await Promise.all([
                    fetchRange('Киноклуб!C5:C'),
                    fetchRange('Киноклуб!B5:F', 'ROWS'),
                    fetchRange('Сводная киноклуба!B3:B15'),
                ]);

                const movies = moviesResponse.values?.[0] ?? [];
                const ratings = parseMovieRatings(ratingsResponse.values ?? []);
                const participants = [...new Set(
                    (participantsResponse.values?.[0] ?? [])
                        .filter((name) => name !== '' && name !== 'Участники')
                        .map((name) => name.trim())
                        .filter(Boolean),
                )];

                setData(movies.filter((item) => item !== '' && item !== '2025' && item !== '2026'));
                setUsersRating(ratings);
                setParticipantNames(participants);
            } catch (error) {
                console.error('Ошибка загрузки данных Google Sheets:', error);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const saveMovie = async (entry: MovieSheetEntry) => {
        if (!accessToken) {
            throw new Error('Необходимо авторизоваться в Google');
        }

        await appendMovieToSheet(accessToken, entry);
    };

    useEffect(() => {
        dispatch(setExcelMovies(data));
    }, [data, dispatch]);

    return { data, usersRating, participantNames, login, isAuthorized, isLoading, userName, userPicture, saveMovie };
};

export default useGetMovies;