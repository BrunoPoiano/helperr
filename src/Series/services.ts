import type { MissingSeriesRecordType, MissingType, Series } from "../types";
import {
  checkMissingResponse,
  IsNumberOrDefault,
  IsString,
  isValidObject,
  returnAlternateTitle,
} from "../utils/utils.js";

export const returnSeriesList = (data: unknown[]): Series[] => {
  return data.reduce<Series[]>((prev, item) => {
    if (!isValidObject(item) || !("id" in item)) return prev;

    const record = item as Record<string, unknown>;

    const series: Series = {
      id: IsNumberOrDefault(record.id, 0),
      title: IsString(record.title, ""),
      path: IsString(record.path, ""),
      alternateTitles: returnAlternateTitle(
        Array.isArray(record.alternateTitles) ? record.alternateTitles : [],
      ),
    };

    prev.push(series);
    return prev;
  }, []);
};

const RecordsArrayFormater = (data: unknown[]): MissingSeriesRecordType[] => {
  return data.reduce<MissingSeriesRecordType[]>((prev, item) => {
    if (!isValidObject(item) || !("id" in item)) return prev;

    const record = item as Record<string, unknown>;

    const resp: MissingSeriesRecordType = {
      seriesId: IsNumberOrDefault(record.seriesId, 0),
      airDate: IsString(record.airDate),
      airDateUtc: IsString(record.airDateUtc),
      lastSearchTime: IsString(record.lastSearchTime),
      id: IsNumberOrDefault(record.id, 0),
    };

    prev.push(resp);

    return prev;
  }, []);
};

export const ReturnSeriesRecordsIds = (
  data: unknown,
): MissingSeriesRecordType[] => {
  const response = checkMissingResponse<MissingType>(data);

  const missingSeriesObj: MissingType = {
    page: IsNumberOrDefault(response.page, 0),
    pageSize: IsNumberOrDefault(response.pageSize, 0),
    totalRecords: IsNumberOrDefault(response.totalRecords, 0),
    records: [],
  };

  if (missingSeriesObj.totalRecords === 0) {
    return [];
  }

  return RecordsArrayFormater(response.records);
};
