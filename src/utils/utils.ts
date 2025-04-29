import dotenv from "dotenv";
import type {
  AlternateTitles,
  Movies,
  Series,
  Torrents,
} from "../types.js";
dotenv.config();

export const prepareComparisonString = (item: string): string => {
  let name = item.toLowerCase();

  name = name.replace(/s\d{2}e\d{2}/gi, ""); // remove "S01E02"
  name = name.replace(/\b(19|20|21)\d{2}\b/g, ""); // remove year
  name = name.replace(/[\[\(].*?[\]\)]/g, ""); // remove content inside () and []
  name = name.replace(/\s-\s\d{2}/g, ""); // remove ep pattern
  name = name.replace(/:/g, ""); // remove :

  const infoList = [
    "amzn",
    "web-dl",
    "blueray",
    "ddp5",
    "yts",
    "playweb",
    "720p",
    "1080p",
    "2160p",
    "upscaled",
    "h265",
    "h264",
    "dv",
    "hdr10+",
    "hdr",
    "ac3",
    "5.1",
    "sub",
    "lcdom",
    "webrip",
    "x265",
    "10bit",
    "aac5.1",
    "ita",
    "eng",
    "web",
    "bili",
    "aac2",
    "264-vary",
    "-higgsboson",
    "multi",
    "aac",
    "v3",
    "mkv",
    "mp4",
    "avi",
    "-successfulcrab",
  ];

  for (const info of infoList) {
    const regex = new RegExp(`\\b${info}\\b`, "gi");
    name = name.replace(regex, "");
  }

  name = name.replace(/\s*\.\s*/g, " "); // replace . surrounded by spaces with a single space
  name = name.replace(/\s+/g, " ").trim(); // Normalize whitespace by collapsing multiple spaces into a single space and trimming

  return name;
};

export const pushBinarySorted = (series: Series[], serie: Series): Series[] => {
  let start = 0;
  let end = series.length - 1;

  while (start <= end) {
    const middle = Math.floor((end + start) / 2);
    if (series[middle].title.localeCompare(serie.title) < 0) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }
  series.splice(start, 0, serie);

  return series;
};

export const mediaBinarySearch = (
  content: Series[] | Movies[],
  compare: string,
): (Series | Movies) | null => {
  let start = 0;
  let end = content.length - 1;

  const content_sorted = [...content].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  // Search Main Title
  while (end >= start) {
    const middle = Math.floor((end + start) / 2);
    const serie_title = prepareComparisonString(content_sorted[middle].title);

    if (serie_title === compare) {
      return content_sorted[middle];
    }

    if (checkSimilar(serie_title, compare) >= 95) {
      return content_sorted[middle];
    }

    if (compare.match(new RegExp(`\\b${serie_title}\\b`))) {
      return content_sorted[middle];
    }

    if (compare.localeCompare(serie_title) < 0) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }

  // Searching Alternative titles
  // animes and foreign titles
  for (const item of content_sorted) {
    if (item.alternateTitles.length > 0) {
      for (const alt_title of item.alternateTitles) {
        const item_title = prepareComparisonString(alt_title.title);

        if (item_title === compare) {
          return item;
        }

        if (checkSimilar(item_title, compare) >= 95) {
          return item;
        }

        if (compare.match(new RegExp(`\\b${item_title}\\b`))) {
          return item;
        }
      }
    }
  }

  return null;
};

const checkSimilar = (source: string, target: string): number => {
  if (source.length === 0 && target.length === 0) return 100;

  const distance = levenshteinDistance(source, target);
  const maxLength = Math.max(source.length, target.length);

  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity * 100) / 100;
};

const levenshteinDistance = (source: string, target: string): number => {
  const matrix: number[][] = Array.from({ length: source.length + 1 }, () =>
    Array.from({ length: target.length + 1 }, () => 0),
  );

  for (let x = 0; x <= source.length; x++) {
    matrix[x][0] = x;
  }

  for (let y = 0; y <= source.length; y++) {
    matrix[0][y] = y;
  }

  for (let x = 1; x <= source.length; x++) {
    for (let y = 1; y <= source.length; y++) {
      if (source[x - 1] === target[y - 1]) {
        matrix[x][y] = matrix[x - 1][y - 1];
      } else {
        matrix[x][y] = Math.min(
          matrix[x][y - 1] + 1,
          matrix[x - 1][y] + 1,
          matrix[x - 1][y - 1] + 1,
        );
      }
    }
  }

  return matrix[source.length][source.length];
};

export const getFileExtension = (filename: string): string | null => {
  const match = filename.match(/\.([^.]*)$/);
  return match ? match[1] : null;
};

export const getSeriesSeason = (torrent_name: string): string => {
  const name = torrent_name.replace(".", " ");

  const series_season = name.match(/s\d{2}e\d{2}/i); // check for "SXXEXX"
  if (series_season) {
    const season = series_season[0].match(/[Ss](\d{2})[Ee]\d{2}/);
    if (season) {
      return `Season ${season[1]}`;
    }
  }

  const whole_season = name.match(/[sS]01/); // check for "SXX"
  if (whole_season) {
    const season = whole_season[0].replace("S", "").replace("s", "");
    return `Season ${season}`;
  }

  return "";
};

export const isValidObject = (obj: unknown): obj is Record<string, unknown> => {
  return typeof obj === "object" && obj !== null;
};

export const isNumberOrDefault = (value: unknown, defaultValue = 0): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    console.log(parsed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return defaultValue;
};

export const isString = <T = null>(
  value: unknown,
  defaultValue = "",
): string | T => {
  if (typeof value === "string" && value.length > 0) return value.trim();

  if (typeof value === "number") return value.toString();

  return defaultValue;
};

export const returnAlternateTitle = (data: unknown[]): AlternateTitles[] => {
  return data.reduce<AlternateTitles[]>((prev, item) => {
    if (!isValidObject(item) || !("title" in item)) return prev;

    const record = item as Record<string, unknown>;

    prev.push({ title: isString(record.title) });
    return prev;
  }, []);
};

export const returnTorrentList = (data: unknown): Torrents[] => {
  if (
    !data ||
    typeof data !== "object" ||
    !("raw" in data) ||
    !Array.isArray(data.raw)
  )
    return [];

  return data.raw.reduce<Torrents[]>((prev, item) => {
    if (!isValidObject(item)) return prev;

    const record = item as Record<string, unknown>;

    if (
      record.category === "tv-sonarr" &&
      record.save_path === "/downloads/tv-sonarr"
    ) {
      return prev;
    }

    prev.push({
      hash: isString(record.hash),
      name: isString(record.name),
      content_path: isString(record.content_path),
    });

    return prev;
  }, []);
};

export const checkMissingResponse = <T = object>(data: unknown): T => {
  return (
    isValidObject(data) && "records" in data && Array(data.records) ? data : {}
  ) as T;
};

export const calcHowManyMinutesSinceLastSearch = (
  lastSearch: string,
): number => {
  const lastSearchTime = new Date(lastSearch);
  const now = new Date();

  const diffMilliseconds = now.getTime() - lastSearchTime.getTime(); // Difference in milliseconds
  return Math.floor(diffMilliseconds / (1000 * 60));
};


export const countImdbidTags = (input: string): number  => {
  const matches = input.match(/\[imdbid-/g);
  return matches ? matches.length : 0;
}
