import { useEffect, useRef, useState } from 'react';
import { type NormalizedMovie } from '../api/movieSource';
import { fetchTmdb } from '../api/tmdb';
import { getTmdbImageUrl } from '../api/tmdbImage';
import type { MovieSheetEntry } from '../api/googleSheets';
import { searchMoviesWithTmdbFallback } from './searchMoviesWithTmdbFallback';

type ParticipantScore = {
  name: string;
  score: string;
};

type MovieEntryForm = {
  date: string;
  title: string;
  participants: ParticipantScore[];
};

type MovieEntryPageProps = {
  participantNames: string[];
  onSave: (entry: MovieSheetEntry) => Promise<void>;
};

const createEmptyParticipant = (): ParticipantScore => ({
  name: '',
  score: '',
});

const MovieEntryPage = ({ participantNames, onSave }: MovieEntryPageProps) => {
  const [form, setForm] = useState<MovieEntryForm>({
    date: '',
    title: '',
    participants: [createEmptyParticipant()],
  });
  const [results, setResults] = useState<NormalizedMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<NormalizedMovie | null>(null);
  const [placeholder, setPlaceholder] = useState('Например: Дурак');
  const [errors, setErrors] = useState<{ date?: string; title?: string; participants?: string }>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const randomPage = Math.floor(Math.random() * 5) + 1;

    fetchTmdb<{ results: Array<Pick<NormalizedMovie, 'title' | 'original_title'>> }>(
      `/movie/popular?language=ru-RU&page=${randomPage}`,
    )
      .then((response) => {
        const items = response.results.slice(0, 5);
        if (items.length === 0) {
          return;
        }

        const randomIndex = Math.floor(Math.random() * items.length);
        const sample = items[randomIndex];
        const title = sample.title || sample.original_title || 'Дурак';

        setPlaceholder(`Например: ${title}`);
      })
      .catch(() => {
        const fallbackTitles = ['Дурак', 'Операция «С Новым годом»', 'Территория', 'Вызов', 'Лето'];
        setPlaceholder(`Например: ${fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)]}`);
      });
  }, []);

  const handleTitleChange = (value: string) => {
    const trimmedValue = value.trim();
    const currentRequestId = ++requestIdRef.current;

    setForm((current) => ({ ...current, title: value }));

    if (!trimmedValue) {
      if (searchTimeoutRef.current !== undefined) {
        window.clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = undefined;
      }
      setResults([]);
      setSelectedMovie(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (searchTimeoutRef.current !== undefined) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => searchMoviesWithTmdbFallback(trimmedValue)
      .then((movies) => {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setResults(movies);
        setSelectedMovie((current) => current ?? movies[0] ?? null);
      })
      .catch((error) => {
        console.error('Ошибка поиска фильма:', error);
        if (currentRequestId === requestIdRef.current) {
          setResults([]);
          setSelectedMovie(null);
        }
      })
      .finally(() => {
        if (currentRequestId === requestIdRef.current) {
          setIsSearching(false);
        }
      })
      .finally(() => {
        searchTimeoutRef.current = undefined;
      }), 500);
  };

  const validateForm = () => {
    const nextErrors: { date?: string; title?: string; participants?: string } = {};

    if (!form.date.trim()) {
      nextErrors.date = 'Выберите дату';
    }

    if (!form.title.trim()) {
      nextErrors.title = 'Введите название фильма';
    }

    const hasEmptyParticipant = form.participants.some((participant) => {
      const hasName = participant.name.trim() !== '';
      const hasScore = participant.score.trim() !== '';

      return !hasName && !hasScore;
    });

    const hasIncompleteParticipant = form.participants.some((participant) => {
      const hasName = participant.name.trim() !== '';
      const hasScore = participant.score.trim() !== '';

      return hasName !== hasScore;
    });

    if (hasEmptyParticipant || hasIncompleteParticipant) {
      nextErrors.participants = 'Для каждого участника укажите имя и оценку';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaveError('');
    setIsSaving(true);

    try {
      await onSave({
        date: form.date,
        title: form.title,
        participants: form.participants.map((participant) => ({
          name: participant.name,
          score: participant.score,
        })),
      });
      setForm({ date: '', title: '', participants: [createEmptyParticipant()] });
      setResults([]);
      setSelectedMovie(null);
      setErrors({});
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Не удалось сохранить запись');
    } finally {
      setIsSaving(false);
    }
  };

  const applySelectedMovie = (movie: NormalizedMovie) => {
    setSelectedMovie(movie);
    setForm((current) => ({
      ...current,
      title: movie.title || movie.original_title || current.title,
    }));
  };

  const addParticipantRow = () => {
    setForm((current) => ({
      ...current,
      participants: [...current.participants, createEmptyParticipant()],
    }));
  };

  const updateParticipantRow = (index: number, field: keyof ParticipantScore, value: string) => {
    setForm((current) => ({
      ...current,
      participants: current.participants.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, [field]: value } : participant,
      ),
    }));
  };

  const removeParticipantRow = (index: number) => {
    setForm((current) => ({
      ...current,
      participants: current.participants.length > 1
        ? current.participants.filter((_, participantIndex) => participantIndex !== index)
        : [createEmptyParticipant()],
    }));
  };

  const selectedParticipantNames = new Set(
    form.participants
      .map((participant) => participant.name)
      .filter(Boolean),
  );

  return (
    <div className="movie-entry-page w-full max-w-6xl mx-auto p-5 text-white">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Кино-клуб</p>
          <h1 className="text-3xl font-semibold text-white">Добавить фильм в таблицу</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-sky-500/40 bg-slate-900/75 p-5 shadow-2xl shadow-sky-950/20 backdrop-blur-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-left text-sm text-slate-200">
              <span>Дата</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => {
                  setForm((current) => ({ ...current, date: event.target.value }));
                  setErrors((current) => ({ ...current, date: undefined }));
                }}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-sky-400"
              />
              {errors.date && <span className="text-xs text-red-400">{errors.date}</span>}
            </label>

            <label className="flex flex-col gap-2 text-left text-sm text-slate-200 md:col-span-2">
              <span>Название</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => {
                  handleTitleChange(event.target.value);
                  setErrors((current) => ({ ...current, title: undefined }));
                }}
                placeholder={placeholder}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-400"
              />
              {errors.title && <span className="text-xs text-red-400">{errors.title}</span>}
            </label>

            <div className="flex flex-col gap-3 text-left text-sm text-slate-200 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <span>Участники и оценки</span>
                <button
                  type="button"
                  onClick={addParticipantRow}
                  className="rounded-lg border border-sky-500/60 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-500/20"
                >
                  + добавить
                </button>
              </div>

              <div className="space-y-3">
                {errors.participants && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {errors.participants}
                  </div>
                )}

                {form.participants.map((participant, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[1.4fr_0.8fr_48px]">
                    <select
                      value={participant.name}
                      onChange={(event) => {
                        updateParticipantRow(index, 'name', event.target.value);
                        setErrors((current) => ({ ...current, participants: undefined }));
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-sky-400"
                    >
                      <option value="">
                        {participantNames.length > 0 ? 'Выберите участника' : 'Участники не загружены'}
                      </option>
                      {participantNames
                        .filter((name) => name === participant.name || !selectedParticipantNames.has(name))
                        .map((name) => (
                        <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={participant.score}
                      onChange={(event) => updateParticipantRow(index, 'score', event.target.value)}
                      placeholder="Оценка"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipantRow(index)}
                      className="rounded-xl border border-red-500/50 bg-red-500/10 px-2 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                      aria-label="Удалить участника"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-sky-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить запись'}
            </button>
            {saveError && <span className="text-sm text-red-300">{saveError}</span>}
          </div>
        </div>

        <aside className="rounded-2xl border border-indigo-500/40 bg-slate-900/75 p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Результаты поиска</h2>

          {!form.title.trim() && (
            <p className="rounded-xl border border-dashed border-slate-700 px-3 py-6 text-sm text-slate-400">
              Введите название фильма.
            </p>
          )}

          {form.title.trim() && isSearching && (
            <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-6 text-sm text-slate-300">
              Поиск...
            </div>
          )}

          {form.title.trim() && !isSearching && results.length === 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-6 text-sm text-amber-100">
              По названию ничего не найдено.
            </div>
          )}

          <div className="space-y-3">
            {results.map((movie) => {
              const poster = movie.poster_path
                ? movie.source === 'kinopoisk'
                  ? movie.poster_path
                  : getTmdbImageUrl('w185', movie.poster_path)
                : movie.poster_path || 'https://placehold.co/185x278/1e293b/94a3b8?text=No+Poster';

              const isSelected = selectedMovie?.id === movie.id && selectedMovie?.source === movie.source;

              return (
                <button
                  key={`${movie.source}-${movie.id}`}
                  type="button"
                  onClick={() => applySelectedMovie(movie)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                    isSelected
                      ? 'border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-900/20'
                      : 'border-slate-700 bg-slate-950/60 hover:border-sky-500/60'
                  }`}
                >
                  <img
                    src={poster}
                    alt={movie.title || movie.original_title}
                    className="h-20 w-14 rounded-lg object-cover"
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/185x278/1e293b/94a3b8?text=No+Poster';
                    }}
                  />
                  <div className="min-w-0 max-w-full flex-1">
                    <p className="max-w-full whitespace-normal wrap-break-word font-medium text-white">{movie.title || movie.original_title}</p>
                    <p className="max-w-full whitespace-normal wrap-break-word text-xs text-slate-400">{movie.original_title || movie.title}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sky-300">
                      {movie.source === 'tmdb' ? 'TMDB' : 'KINOPOISK'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </form>
    </div>
  );
};

export default MovieEntryPage;
