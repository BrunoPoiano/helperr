import type { Movies } from "../types.js";
import {
  isNumberOrDefault,
  isString,
  isValidObject,
  returnAlternateTitle,
} from "../utils/utils.js";

/**
 * Converts an array of unknown data into an array of Movies objects
 * @param data - Array of unknown items to be processed
 * @returns Array of Movies objects
 */
export const getMoviesList = (data: unknown[]): Movies[] => {
  return data.reduce<Movies[]>((prev, item) => {
    // Skip invalid items or items without an id
    if (!isValidObject(item) || !("id" in item)) return prev;

    const record = item as Record<string, unknown>;

    // Create a Movies object with safe type conversion
    const movies: Movies = {
      id: isNumberOrDefault(record.id, 0),
      title: isString(record.title, ""),
      path: isString(record.path, ""),
      movieFileId: isNumberOrDefault(record.movieFileId, 0),
      movieFile: {
        path: isString(record.path, ""),
        relativePath: isString(record.relativePath, ""),
      },
      alternateTitles: returnAlternateTitle(
        Array.isArray(record.alternateTitles) ? record.alternateTitles : [],
      ),
    };

    prev.push(movies);
    return prev;
  }, []);
};
