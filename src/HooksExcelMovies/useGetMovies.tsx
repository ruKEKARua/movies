import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setExcelMovies } from '../store/excelMovies';

const useGetMovies = () => {

    const dispatch = useDispatch();

    const [data, setData] = useState<string[]>([]);

    const login = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        onSuccess: async (tokenResponse) => {
            const token = tokenResponse.access_token;

            const spreadsheetId = '1DD6U6fawOirU61-ZuP4GYpoK2p2eLUV2PbJe26uB7A8';
            const sheetName = 'Киноклуб';
            const range = encodeURIComponent(`${sheetName}!C5:C`); // Экранируем имя листа и диапазон

            try {
                const res = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?majorDimension=columns`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                );

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error('Ошибка Google API:', errorData);
                    return;
                }

                const data = await res.json();
                const films = data.values[0].filter((item:string) => item !== "" && item !== "2025" && item !== "2026");

                setData(films)

                //console.log('Фильмы из таблицы Киноклуба (Весь столбец C): ', films);

            } catch (err) {

              console.error('Ошибка сети или запроса:', err);

            }

        },

    });

    useEffect(() => {

        if (data == null) {
            console.error('ФИЛЬМЫ С ЭКСЕЛЯ ВЕРНУЛИ NULL')
        }
        dispatch(setExcelMovies(data));

    }, [data, dispatch])
    
    return { data, login };

}

export default useGetMovies