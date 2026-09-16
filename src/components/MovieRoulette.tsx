import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMoviesFromSource, type NormalizedMovie } from '../api/movieSource';
import Button from './UI/Button';
import { getTmdbImageUrl } from '../api/tmdbImage';
import Modal from './Modal';
import { openModal } from '../store/openModal';
import type { RootState } from '../store/store';
import type { MovieRatings } from '../HooksExcelMovies/useGetMovies';

type RouletteMode = 'elimination' | 'winner';
type RouletteSource = 'excel' | 'online';

type RouletteMovie = NormalizedMovie & {
    excelTitle?: string;
};

type MovieRouletteProps = {
    excelMovies: RouletteMovie[];
    isAuthorized: boolean;
    login: () => void;
    ratings: MovieRatings[];
    onClose: () => void;
};

const randomIndex = (length: number) => {
    if (length < 1) {
        throw new Error('Нельзя выбрать фильм из пустого массива');
    }

    const maxUint32 = 0x100000000;
    const limit = maxUint32 - (maxUint32 % length);
    const buffer = new Uint32Array(1);

    do {
        crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return buffer[0] % length;
};

const movieTitle = (movie: RouletteMovie) => movie.title || movie.original_title || 'Без названия';

const movieKey = (movie: RouletteMovie) => `${movie.source}-${movie.id}-${movie.excelTitle ?? ''}`;
const wheelColors = ['#343946', '#252936'];
const wheelDivider = '#171920';
const wheelDividerAngle = 0.2;

const getWheelBackground = (movieCount: number) => {
    if (movieCount === 0) {
        return `conic-gradient(${wheelColors[0]} 0deg 360deg)`;
    }

    const sectorAngle = 360 / movieCount;
    const colorOffset = movieCount % 2 === 1 ? 1 : 0;
    const stops = Array.from({ length: movieCount }, (_, index) => {
        const start = index * sectorAngle;
        const end = (index + 1) * sectorAngle;
        const dividerStart = Math.max(start, end - wheelDividerAngle);
        return `${wheelColors[(index + colorOffset) % wheelColors.length]} ${start}deg ${dividerStart}deg, ${wheelDivider} ${dividerStart}deg ${end}deg`;
    });

    return `conic-gradient(from ${-sectorAngle / 2}deg, ${stops.join(', ')})`;
};

const MovieRoulette = ({ excelMovies, isAuthorized, login, ratings, onClose }: MovieRouletteProps) => {
    const dispatch = useDispatch();
    const isModalOpen = useSelector((state: RootState) => state.openModal.value);
    const [source, setSource] = useState<RouletteSource>('excel');
    const [mode, setMode] = useState<RouletteMode>('elimination');
    const [query, setQuery] = useState('');
    const [onlineResults, setOnlineResults] = useState<RouletteMovie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [selectedMovies, setSelectedMovies] = useState<RouletteMovie[]>([]);
    const [winner, setWinner] = useState<RouletteMovie | null>(null);
    const [lastEliminated, setLastEliminated] = useState<RouletteMovie | null>(null);
    const [modalMovie, setModalMovie] = useState<RouletteMovie | null>(null);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);
    const [spinDurationMs, setSpinDurationMs] = useState(10200);
    const [spinTurns, setSpinTurns] = useState(5);

    useEffect(() => {
        if (source !== 'online' || !query.trim()) {
            return;
        }

        let cancelled = false;

        const timeoutId = window.setTimeout(() => {
            setIsSearching(true);
            setSearchError('');
            searchMoviesFromSource(query.trim())
                .then((movies) => {
                    if (!cancelled) setOnlineResults(movies);
                })
                .catch(() => {
                    if (!cancelled) {
                        setOnlineResults([]);
                        setSearchError('Не удалось выполнить поиск. Проверьте доступность TMDB или Kinopoisk.');
                    }
                })
                .finally(() => {
                    if (!cancelled) setIsSearching(false);
                });
        }, 350);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [query, source]);

    const selectedKeys = new Set(selectedMovies.map(movieKey));

    const availableMovies = useMemo(() => {
        if (source === 'online') return query.trim() ? onlineResults : [];

        const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
        if (!normalizedQuery) return excelMovies;

        return excelMovies.filter((movie) => [movieTitle(movie), movie.original_title]
            .some((title) => title.toLocaleLowerCase('ru-RU').includes(normalizedQuery)));
    }, [excelMovies, onlineResults, query, source]);
    const canStart = selectedMovies.length > 0 && !winner && (mode === 'winner' || selectedMovies.length > 1);

    const addMovie = (movie: RouletteMovie) => {
        if (!spinning && !selectedKeys.has(movieKey(movie))) {
            setSelectedMovies((current) => [...current, movie]);
            setWinner(null);
        }
    };

    const removeMovie = (key: string) => {
        if (spinning) return;
        setSelectedMovies((current) => current.filter((movie) => movieKey(movie) !== key));
        setWinner(null);
    };

    const spin = () => {
        if (!canStart || spinning) return;

        const index = randomIndex(selectedMovies.length);
        const sectorAngle = 360 / selectedMovies.length;
        const chosenAngle = index * sectorAngle;

        setPendingIndex(index);
        setSpinning(true);
        setLastEliminated(null);
        setWinner(null);
        setRotation((current) => current + spinTurns * 360 + (360 - chosenAngle));
    };

    const finishSpin = () => {
        if (pendingIndex === null) return;

        const chosenMovie = selectedMovies[pendingIndex];
        if (mode === 'winner') {
            setWinner(chosenMovie);
        } else {
            setLastEliminated(chosenMovie);
            const remainingMovies = selectedMovies.filter((_, movieIndex) => movieIndex !== pendingIndex);
            setSelectedMovies(remainingMovies);
            if (remainingMovies.length === 1) {
                setWinner(remainingMovies[0]);
            }
        }

        setPendingIndex(null);
        setSpinning(false);
    };

    const reset = () => {
        if (spinning) return;
        setSelectedMovies([]);
        setWinner(null);
        setLastEliminated(null);
        setModalMovie(null);
    };

    const posterUrl = (movie: RouletteMovie) => movie.source === 'kinopoisk'
        ? movie.poster_path
        : getTmdbImageUrl('w185', movie.poster_path);

    const openMovieModal = (movie: RouletteMovie) => {
        setModalMovie(movie);
        dispatch(openModal());
    };

    return (
        <main className="roulette-page">
            <header className="roulette-header">
                <div>
                    <p className="roulette-kicker">КИНОКЛУБ / СЛУЧАЙНЫЙ ВЫБОР</p>
                    <h1>Рулетка фильмов</h1>
                </div>
                <Button label="Вернуться к каталогу" onClick={onClose} className="roulette-secondary-button" />
            </header>

            <div className="roulette-layout">
                <section className="roulette-controls" aria-label="Настройки рулетки">
                    <div className="roulette-control-group">
                        <span className="roulette-label">Источник фильмов</span>
                        <div className="roulette-segmented">
                            <button disabled={spinning} className={source === 'excel' ? 'is-active' : ''} onClick={() => setSource('excel')}>Excel</button>
                            <button disabled={spinning} className={source === 'online' ? 'is-active' : ''} onClick={() => setSource('online')}>TMDB / Kinopoisk</button>
                        </div>
                    </div>

                    <div className="roulette-control-group">
                        <span className="roulette-label">Режим</span>
                        <div className="roulette-segmented">
                            <button disabled={spinning} className={mode === 'elimination' ? 'is-active' : ''} onClick={() => { setMode('elimination'); setWinner(null); }}>На выбывание</button>
                            <button disabled={spinning} className={mode === 'winner' ? 'is-active' : ''} onClick={() => { setMode('winner'); setWinner(null); }}>На победу</button>
                        </div>
                    </div>

                    <div className="roulette-control-group roulette-strength-controls">
                        <span className="roulette-label">Сила вращения</span>
                        <label className="roulette-range-label" htmlFor="roulette-turns">
                            Обороты <output>{spinTurns}</output>
                        </label>
                        <input
                            id="roulette-turns"
                            className="roulette-range"
                            type="range"
                            min="2"
                            max="12"
                            step="1"
                            value={spinTurns}
                            disabled={spinning}
                            onChange={(event) => setSpinTurns(Number(event.target.value))}
                        />
                        <label className="roulette-range-label" htmlFor="roulette-duration">
                            Длительность <output>{(spinDurationMs / 1000).toFixed(1)} с</output>
                        </label>
                        <input
                            id="roulette-duration"
                            className="roulette-range"
                            type="range"
                            min="4"
                            max="20"
                            step="0.5"
                            value={spinDurationMs / 1000}
                            disabled={spinning}
                            onChange={(event) => setSpinDurationMs(Number(event.target.value) * 1000)}
                        />
                    </div>

                    <label className="roulette-label" htmlFor="roulette-search">Поиск по названию</label>
                    <input id="roulette-search" className="roulette-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: Интерстеллар" />
                    {isSearching && <p className="roulette-hint">Ищем фильм...</p>}
                    {searchError && <p className="roulette-error">{searchError}</p>}

                    <div className="roulette-results">
                        {source === 'excel' && !isAuthorized && (
                            <div className="roulette-login-notice">
                                <p>Войдите, чтобы выбрать просмотренные фильмы</p>
                                <Button label="Авторизоваться" onClick={login} className="roulette-login-button" />
                            </div>
                        )}
                        {availableMovies.filter((movie) => !selectedKeys.has(movieKey(movie))).map((movie) => {
                            const key = movieKey(movie);
                            return (
                                <button key={key} className="roulette-result" onClick={() => addMovie(movie)}>
                                    <span className="roulette-result-title">
                                        {posterUrl(movie) && <img src={posterUrl(movie)} alt="" />}
                                        {movieTitle(movie)}
                                    </span>
                                    <small>{movie.source === 'kinopoisk' ? 'Kinopoisk' : source === 'excel' ? 'Excel' : 'TMDB'}</small>
                                </button>
                            );
                        })}
                        {!isSearching && availableMovies.length === 0 && <p className="roulette-hint">Фильмы не найдены</p>}
                    </div>
                </section>

                <section className="roulette-stage" aria-live="polite">
                    <div className="roulette-stage-heading">
                        <div>
                            <span className="roulette-label">Участники</span>
                            <h2>{selectedMovies.length} {selectedMovies.length === 1 ? 'фильм' : 'фильмов'} в рулетке</h2>
                        </div>
                        <Button label="Очистить" onClick={reset} className="roulette-ghost-button" />
                    </div>

                    <div className="roulette-board">
                        <div className="roulette-wheel-panel">
                            <div className="roulette-wheel-wrap">
                                <div className="roulette-pointer" aria-hidden="true" />
                                <div
                                    className={`roulette-wheel ${spinning ? 'is-spinning' : ''}`}
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transitionDuration: `${spinDurationMs}ms`,
                                        background: getWheelBackground(selectedMovies.length),
                                    }}
                                    onTransitionEnd={finishSpin}
                                    aria-label="Колесо рулетки"
                                >
                                    {selectedMovies.map((movie, index) => {
                                        const angle = (360 / selectedMovies.length) * index;
                                        return (
                                            <div
                                                className="roulette-poster-slot"
                                                key={movieKey(movie)}
                                                style={{
                                                    '--poster-angle': `${angle}deg`,
                                                } as CSSProperties}
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`Открыть описание: ${movieTitle(movie)}`}
                                                onClick={() => openMovieModal(movie)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault();
                                                        openMovieModal(movie);
                                                    }
                                                }}
                                            >
                                                {posterUrl(movie) ? <img src={posterUrl(movie)} alt={movieTitle(movie)} /> : <span>{movieTitle(movie)}</span>}
                                            </div>
                                        );
                                    })}
                                    <button
                                        className="roulette-wheel-center"
                                        onClick={spin}
                                        disabled={!canStart || spinning}
                                        aria-label={mode === 'winner' ? 'Выбрать победителя' : 'Выбрать выбывший фильм'}
                                    >
                                        {winner ? 'ПОБЕДИТЕЛЬ' : lastEliminated ? 'ЕЩЁ РАЗ' : spinning ? 'КРУТИМ' : 'КРУТИТЬ'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <aside className="roulette-chips" aria-label="Список выбранных фильмов">
                            <span className="roulette-label">Фильмы в рулетке</span>
                            {lastEliminated && (
                                <button className="roulette-eliminated" onClick={() => openMovieModal(lastEliminated)}>
                                    <img src={posterUrl(lastEliminated)} alt="" />
                                    <span>Выбыл: <strong>{movieTitle(lastEliminated)}</strong></span>
                                </button>
                            )}
                            {selectedMovies.map((movie) => (
                                <div className="roulette-chip" key={movieKey(movie)}>
                                    <button aria-label={`Убрать ${movieTitle(movie)}`} onClick={() => removeMovie(movieKey(movie))}>×</button>
                                    <span>{movieTitle(movie)}</span>
                                </div>
                            ))}
                            {selectedMovies.length === 0 && <p className="roulette-empty">Добавьте фильмы из списка слева, чтобы начать.</p>}
                        </aside>
                    </div>

                    {mode === 'elimination' && selectedMovies.length === 1 && !winner && <p className="roulette-hint">{movieTitle(selectedMovies[0])} последний в списке и становится победителем.</p>}
                </section>
            </div>
            {isModalOpen && modalMovie && (
                <Modal
                    isHidden=""
                    movie_ID={modalMovie.id}
                    source={modalMovie.source}
                    ratings={ratings}
                    excelMovieTitle={modalMovie.excelTitle}
                />
            )}
        </main>
    );
};

export default MovieRoulette;