import type {  MissingRecordType, MissingType, Series } from "../types";
import {
  checkMissingResponse,
  isNumberOrDefault,
  isString,
  isValidObject,
  returnAlternateTitle,
} from "../utils/utils.js";

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

const recordsArrayFormatter = (data: unknown[]): MissingRecordType[] => {
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

export const getRecordIds = (
  data: unknown,
): MissingRecordType[] => {
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

  return recordsArrayFormatter(response.records);
};
