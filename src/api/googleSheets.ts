const spreadsheetId = '1DD6U6fawOirU61-ZuP4GYpoK2p2eLUV2PbJe26uB7A8';
const sheetName = 'Киноклуб';
const columnCount = 6;

type GoogleSheetProperties = {
  sheetId: number;
  title: string;
  gridProperties?: {
    columnCount?: number;
  };
};

type GoogleSpreadsheetResponse = {
  sheets?: Array<{ properties: GoogleSheetProperties }>;
};

type GoogleSheetsResponse = {
  values?: string[][];
};

export type MovieSheetEntry = {
  date: string;
  title: string;
  participants: Array<{ name: string; score: string }>;
};

const getHeaders = (accessToken: string): HeadersInit => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

const getSpreadsheetUrl = (path = '') =>
  `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`;

const requestJson = async <T>(url: string, accessToken: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...getHeaders(accessToken),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Не удалось сохранить запись в Google Sheets');
  }

  return response.json() as Promise<T>;
};

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
};

const getAverage = (participants: MovieSheetEntry['participants']) => {
  const scores = participants
    .map((participant) => Number(participant.score.replace(',', '.')))
    .filter((score) => Number.isFinite(score));
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return average.toFixed(1).replace('.', ',');
};

const getNextMovieNumber = (rows: string[][]) => {
  const movieNumbers = rows
    .filter((row) => row[2]?.trim() && !Number.isFinite(Number(row[2])))
    .map((row) => Number(row[0]))
    .filter((number) => Number.isInteger(number) && number > 0 && number < 1900);

  return (movieNumbers.length > 0 ? Math.max(...movieNumbers) : 0) + 1;
};

export async function appendMovieToSheet(accessToken: string, entry: MovieSheetEntry) {
  const [spreadsheet, sheetValues] = await Promise.all([
    requestJson<GoogleSpreadsheetResponse>(getSpreadsheetUrl('?fields=sheets.properties'), accessToken),
    requestJson<GoogleSheetsResponse>(
      getSpreadsheetUrl(`/values/${encodeURIComponent(`${sheetName}!A:F`)}?majorDimension=ROWS`),
      accessToken,
    ),
  ]);

  const sheet = spreadsheet.sheets?.find(({ properties }) => properties.title === sheetName)?.properties;
  if (!sheet) {
    throw new Error(`Лист «${sheetName}» не найден`);
  }

  const sheetColumnCount = sheet.gridProperties?.columnCount ?? columnCount;
  const participants = entry.participants.filter((participant) => participant.name.trim() !== '');
  const firstMovieRow = (sheetValues.values?.length ?? 0) + 2;
  const lastMovieRow = firstMovieRow + participants.length - 1;
  const lastRow = lastMovieRow + 1;
  const movieNumber = getNextMovieNumber(sheetValues.values ?? []);
  const average = getAverage(participants);
  const rows = [
    Array<string>(columnCount).fill(''),
    ...participants.map((participant, index) => [
      index === 0 ? String(movieNumber) : '',
      index === 0 ? formatDate(entry.date) : '',
      index === 0 ? entry.title.trim() : '',
      participant.name.trim(),
      participant.score.trim().replace('.', ','),
      index === 0 ? average : '',
    ]),
    Array<string>(columnCount).fill(''),
  ];

  await requestJson(
    getSpreadsheetUrl(`/values/${encodeURIComponent(`${sheetName}!A${firstMovieRow - 1}:F${lastRow}`)}?valueInputOption=USER_ENTERED`),
    accessToken,
    {
      method: 'PUT',
      body: JSON.stringify({ range: `${sheetName}!A${firstMovieRow - 1}:F${lastRow}`, majorDimension: 'ROWS', values: rows }),
    },
  );

  const separatorRows = [firstMovieRow - 2, lastRow - 1];
  await requestJson(getSpreadsheetUrl(':batchUpdate'), accessToken, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        ...separatorRows.map((rowIndex) => ({
          repeatCell: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 0,
              endColumnIndex: sheetColumnCount,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 67 / 255, green: 67 / 255, blue: 67 / 255 },
                borders: {
                  top: { style: 'SOLID', color: { red: 67 / 255, green: 67 / 255, blue: 67 / 255 } },
                  bottom: { style: 'SOLID', color: { red: 67 / 255, green: 67 / 255, blue: 67 / 255 } },
                  left: { style: 'SOLID', color: { red: 67 / 255, green: 67 / 255, blue: 67 / 255 } },
                  right: { style: 'SOLID', color: { red: 67 / 255, green: 67 / 255, blue: 67 / 255 } },
                },
              },
            },
            fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.borders',
          },
        })),
        ...[
          [0, 1],
          [1, 2],
          [2, 3],
          [5, 6],
        ].map(([startColumnIndex, endColumnIndex]) => ({
          mergeCells: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: firstMovieRow - 1,
              endRowIndex: lastMovieRow,
              startColumnIndex,
              endColumnIndex,
            },
            mergeType: 'MERGE_ALL',
          },
        })),
        ...[0, 1, 2, 5].map((columnIndex) => ({
          repeatCell: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: firstMovieRow - 1,
              endRowIndex: lastMovieRow,
              startColumnIndex: columnIndex,
              endColumnIndex: columnIndex + 1,
            },
            cell: {
              userEnteredFormat: {
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
            fields: 'userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment',
          },
        })),
      ],
    }),
  });
}
