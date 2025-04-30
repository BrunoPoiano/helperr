import { moviesCompareAndChangeLocation } from "./Movies/checkMovies.js";
import { seriesCompareAndChangeLocation } from "./Series/checkSeries.js";

await moviesCompareAndChangeLocation();
await seriesCompareAndChangeLocation();
