import type { MissingType, Movies } from "../types";
import {
  checkMissingResponse,
  IsNumberOrDefault,
  IsString,
  isValidObject,
  returnAlternateTitle,
} from "../utils/utils.js";

export const returnMoviesList = (data: unknown[]): Movies[] => {
  return data.reduce<Movies[]>((prev, item) => {
    if (!isValidObject(item) || !("id" in item)) return prev;

    const record = item as Record<string, unknown>;

    const movies: Movies = {
      id: IsNumberOrDefault(record.id, 0),
      title: IsString(record.title, ""),
      path: IsString(record.path, ""),
      movieFileId: IsNumberOrDefault(record.movieFileId, 0),
      movieFile: {
        path: IsString(record.path, ""),
        relativePath: IsString(record.relativePath, ""),
      },
      alternateTitles: returnAlternateTitle(
        Array.isArray(record.alternateTitles) ? record.alternateTitles : [],
      ),
    };

    prev.push(movies);
    return prev;
  }, []);
};
