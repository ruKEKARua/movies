import { searchMoviesFromSource } from '../api/movieSource';

const normalizeTitle = (value: string) => value
    .toLocaleLowerCase('ru-RU')
    .replace(/[«»"']/g, '')
    .replace(/\s*\(\d{4}\)\s*$/, '')
    .trim();

const getRequestedYear = (value: string) => value.match(/\b(18|19|20)\d{2}\b/)?.[0];

async function findMovieBySearchTitle(title: string) {
    const excelTitle = title;
    const normalizedTitle = title.toLocaleLowerCase('ru-RU');
    const requestedYear = getRequestedYear(title);
    let preferredMovieId: number | undefined;

    if (normalizeTitle(title) === 'комната') {
        preferredMovieId = 17473;
    }

    switch (normalizedTitle) {
        case 'комната': {
            break;
        }
        case 'вершина':
            title = 'На вершине';
            break;
        case 'толкатель':
            title = 'Дилер';
            break;
        case 'толкатель 2':
            title = 'Дилер 2';
            break;
        case 'бивис и баттхед уделывают америку (1996)':
            title = 'Бивис и Баттхед уделывают Америку';
            preferredMovieId = 3179;
            break;
        case 'чёрный котёл':
            title = 'The Black Cauldron';
            preferredMovieId = 10957;
            break;
        case 'гром в штанах':
            title = 'Thunderpants';
            preferredMovieId = 21605;
            break;
        case 'золушка (2021)':
            title = 'Cinderella';
            preferredMovieId = 593910;
            break;
        case 'птицекалипсис: шок и трепет':
            title = 'Birdemic: Shock and Terror';
            preferredMovieId = 40016;
            break;
        case '🎄 клаус 🎄': 
            title = 'Клаус';
            break;

        default:
            break;
    }
    
        const movies = await searchMoviesFromSource(title);
        const exactTitleMatches = movies.filter((item) =>
            normalizeTitle(item.title) === normalizeTitle(title)
            || normalizeTitle(item.original_title) === normalizeTitle(title),
        );
        const yearMatches = (requestedYear
            ? exactTitleMatches.filter((item) => item.release_date?.startsWith(requestedYear))
            : exactTitleMatches);
        const movie = (preferredMovieId && movies.find((item) => item.id === preferredMovieId))
            ?? yearMatches[0]
            ?? exactTitleMatches[0]
            ?? movies[0];

        return movie ? { ...movie, excelTitle } : null;
}

export default findMovieBySearchTitle;