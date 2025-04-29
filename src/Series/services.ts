import type { MissingRecordType, MissingType, Series } from "../types";
import {
  checkMissingResponse,
  isNumberOrDefault,
  isString,
  isValidObject,
  returnAlternateTitle,
} from "../utils/utils.js";

/**
 * Converts raw data array into a properly formatted Series array
 * @param data - Array of unknown objects to process
 * @returns Array of Series objects with validated properties
 */
export const getSeriesList = (data: unknown[]): Series[] => {
  return data.reduce<Series[]>((prev, item) => {
    if (!isValidObject(item) || !("id" in item)) return prev;

    const record = item as Record<string, unknown>;

    const series: Series = {
      id: isNumberOrDefault(record.id, 0),
      title: isString(record.title, ""),
      path: isString(record.path, ""),
      alternateTitles: returnAlternateTitle(
        Array.isArray(record.alternateTitles) ? record.alternateTitles : [],
      ),
    };

    prev.push(series);
    return prev;
  }, []);
};

/**
 * Formats an array of unknown data into MissingRecordType objects
 * @param data - Array of unknown objects to format
 * @returns Array of properly formatted MissingRecordType objects
 */
const RecordsArrayFormater = (data: unknown[]): MissingRecordType[] => {
  return data.reduce<MissingRecordType[]>((prev, item) => {
    if (!isValidObject(item) || !("id" in item)) return prev;

    const record = item as Record<string, unknown>;

    const resp: MissingRecordType = {
      seriesId: isNumberOrDefault(record.seriesId, 0),
      airDate: isString(record.airDate),
      airDateUtc: isString(record.airDateUtc),
      lastSearchTime: isString(record.lastSearchTime),
      id: isNumberOrDefault(record.id, 0),
    };

    prev.push(resp);

    return prev;
  }, []);
};

/**
 * Extracts and validates series record IDs from response data
 * @param data - Unknown data to process
 * @returns Array of MissingRecordType objects or empty array if no records
 */
export const getRecordIds = (data: unknown): MissingRecordType[] => {
  const response = checkMissingResponse<MissingType>(data);

  const missingSeriesObj: MissingType = {
    page: isNumberOrDefault(response.page, 0),
    pageSize: isNumberOrDefault(response.pageSize, 0),
    totalRecords: isNumberOrDefault(response.totalRecords, 0),
    records: [],
  };

  if (missingSeriesObj.totalRecords === 0) {
    return [];
  }

  return RecordsArrayFormater(response.records);
};
