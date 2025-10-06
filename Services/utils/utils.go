package utils

import (
	"fmt"
	"helperr/types"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

type Media interface {
	GetTitle() string
	GetAlternateTitles() []types.AlternateTitle
	GetSortTitle() string
}

var VideoExtensions = map[string]bool{
	"mp4":  true,
	"mkv":  true,
	"avi":  true,
	"mov":  true,
	"wmv":  true,
	"flv":  true,
	"webm": true,
	"nfo":  true,
}

// PrepareComparisonString prepares a string for comparison by removing irrelevant parts like season/episode numbers, years, and common release group tags.
//
// Parameters:
//   - item: The input string to prepare.
//
// Returns:
//   - The prepared string, lowercased and stripped of irrelevant information.
func PrepareComparisonString(item string) string {
	var name = strings.ToLower(item)

	name = regexp.MustCompile(`(?i)s\d{2}e\d{2}`).ReplaceAllString(name, "")          // remove "S01E02"
	name = regexp.MustCompile(`\b(18|19|20|21|22)\d{2}\b`).ReplaceAllString(name, "") // remove year
	name = regexp.MustCompile(`(\[.*?\]|\(.*?\))`).ReplaceAllString(name, "")         // remove content inside () and []
	name = regexp.MustCompile(`\s-\s\d{2}`).ReplaceAllString(name, "")                // remove ep pattern

	infoList := []string{
		"amzn",
		"web-dl",
		"blueray",
		"remux",
		"webrip",
		"ddp5",
		"flac",
		"dd5.1",
		"dd5",
		"dvdrip",
		"yts",
		"playweb",
		"720p",
		"1080p",
		"2160p",
		"upscaled",
		"-edith",
		"h265",
		"h264",
		"h.265",
		"h.264",
		"nf",
		"dv",
		"hdr10+",
		"encode/dvd",
		"encode/webrip",
		"hdr",
		"ac3",
		"5.1",
		"sub",
		"lcdom",
		"x264",
		"x265",
		"x.264",
		"x.265",
		"10bit",
		"ita",
		"eng",
		"web",
		"bili",
		"aac",
		"aac1",
		"aac1.0",
		"aac2",
		"aac2.0",
		"aac5.1",
		"264-vary",
		"-higgsboson",
		"multi",
		"avc/hevc",
		"hevc",
		"avc",
		"v3",
		"mkv",
		"mp4",
		"ethel",
		"avi",
		"eztvx.to",
		"eztvx",
		"-successfulcrab"}

	for _, info := range infoList {
		name = strings.ReplaceAll(name, info, "")
	}
	name = strings.ReplaceAll(name, " - ", "") // remove -
	name = strings.ReplaceAll(name, ":", "")   // remove :
	name = strings.ReplaceAll(name, ".", " ")  // replace . surrounded by spaces with a single space
	name = strings.TrimSpace(name)
	return name
}

// MediaBinarySearch performs a binary search on a slice of Media items.
//
// Parameters:
//   - content: The slice of Media items to search.
//   - compare: The string to compare against the Media titles.
//
// Returns:
//   - A pointer to the found Media item, or nil if not found. Also returns an error if not found.
func MediaBinarySearch[T Media](content []T, compare string) (*T, error) {

	start := 0
	end := len(content)

	sort.Slice(content, func(i, j int) bool {
		if strings.Compare(content[i].GetTitle(), content[j].GetTitle()) < 0 {
			return true
		}
		return false
	})

	compare = PrepareComparisonString(compare)
	// Search Main GetTitle()
	for {
		if end > start {
			middle := (end + start) / 2
			serie_title := PrepareComparisonString(content[middle].GetTitle())

			if serie_title == compare {
				return &content[middle], nil
			}

			regexCompare := regexp.MustCompile(`\b` + regexp.QuoteMeta(serie_title) + `\b`).MatchString(compare)

			if regexCompare {
				return &content[middle], nil
			}

			regexCompare = regexp.MustCompile(`\b` + regexp.QuoteMeta(content[middle].GetSortTitle()) + `\b`).MatchString(compare)

			if regexCompare {
				return &content[middle], nil
			}

			regexCompare = regexp.MustCompile(`\b` + regexp.QuoteMeta(compare) + `\b`).MatchString(serie_title)

			if regexCompare {
				return &content[middle], nil
			}

			if strings.Compare(compare, serie_title) < 0 {
				end = middle - 1
			} else {
				start = middle + 1
			}

		} else {
			break
		}
	}

	// Searching Alternative titles
	// animes and foreign titles
	for _, item := range content {
		if len(item.GetAlternateTitles()) > 0 {
			for _, alt_title := range item.GetAlternateTitles() {
				item_title := PrepareComparisonString(alt_title.Title)

				if item_title == compare {
					return &item, nil
				}

				regexCompare := regexp.MustCompile(`\b` + regexp.QuoteMeta(item_title) + `\b`).MatchString(compare)

				if regexCompare {
					return &item, nil
				}
			}
		}
	}

	return nil, fmt.Errorf("Movie Not Found")
}

// HasImdbidTags checks if the input string has IMDB ID tags.
//
// Parameters:
//   - input: The input string to check.
//
// Returns:
//   - True if the input string has IMDB ID tags, false otherwise.
func HasImdbidTags(input string) bool {
	count := regexp.MustCompile(`imdbid-`).FindAllStringIndex(input, -1)
	return len(count) == 2
}

// MinutesSinceLastSearch calculates the number of minutes since the last search.
//
// Parameters:
//   - lastSearch: The timestamp of the last search in RFC3339 format.
//
// Returns:
//   - The number of minutes since the last search, or an error if the timestamp is invalid.
func MinutesSinceLastSearch(
	lastSearch string,
) (int, error) {
	lastSearchTime, err := time.Parse(time.RFC3339, lastSearch)
	if err != nil {
		return 0, err
	}

	now := time.Now()
	diff := now.Sub(lastSearchTime)
	return int(diff.Minutes()), nil
}

// SeriesSeason extracts the season information from a torrent name.
//
// Parameters:
//   - torrentName: The name of the torrent.
//
// Returns:
//   - The season information, or an empty string if not found.
func SeriesSeason(torrentName string) string {
	name := strings.ReplaceAll(torrentName, ".", " ")
	season := regexp.MustCompile(`[Ss][0-9]{2}`).FindString(name)
	if season != "" {
		return fmt.Sprintf("Season %s", season)
	}
	return season
}

// ParseUndesiredExtentions parses a string of undesired extensions into a map.
//
// Parameters:
//   - raw: The raw string of extensions, comma separated and enclosed in square brackets.
//
// Returns:
//   - A map of undesired extensions, where the key is the extension and the value is true.
func ParseUndesiredExtentions(raw string) map[string]bool {

	values := make(map[string]bool)
	rawTrimed := strings.Trim(raw, "[]")

	for _, item := range strings.Split(rawTrimed, ",") {
		n := strings.Trim(item, " ")
		values[n] = true
	}

	return values
}

// ReturnEnvVariable returns the value of an environment variable with a default value.
//
// Parameters:
//   - key: The name of the environment variable.
//   - default_value: The default value to return if the environment variable is not set.
//
// Returns:
//   - The value of the environment variable, or the default value if not set.
func ReturnEnvVariable[T interface{}](key string, default_value T) T {
	envKey := os.Getenv(key)
	if envKey == "" {
		return default_value
	}

	switch any(default_value).(type) {
	case int:
		value, _ := strconv.Atoi(envKey)
		return any(value).(T)
	case string:
		return any(envKey).(T)
	default:
		return default_value
	}

}
