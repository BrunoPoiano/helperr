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

func PrepareComparisonString(item string) string {
	var name = strings.ToLower(item)

	name = regexp.MustCompile(`/s\d{2}e\d{2}/gi`).ReplaceAllString(name, "")
	name = regexp.MustCompile(`/s\d{2}e\d{2}/gi`).ReplaceAllString(name, "")       // remove "S01E02"
	name = regexp.MustCompile(`/\b(19|20|21)\d{2}\b/g`).ReplaceAllString(name, "") // remove year
	name = regexp.MustCompile(`/[\[\(].*?[\]\)]/g`).ReplaceAllString(name, "")     // remove content inside () and []
	name = regexp.MustCompile(`/\s-\s\d{2}/g`).ReplaceAllString(name, "")          // remove ep pattern
	name = regexp.MustCompile(`/:/g`).ReplaceAllString(name, "")                   // remove :

	infoList := []string{
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
		"-successfulcrab"}

	for _, info := range infoList {
		name = regexp.MustCompile(fmt.Sprintf("\\b%s\\b", info)).ReplaceAllString(name, "")
	}

	name = regexp.MustCompile(`/\s*\.\s*/g`).ReplaceAllString(name, "") // replace . surrounded by spaces with a single space
	name = regexp.MustCompile(`/\s+/g`).ReplaceAllString(name, "")      // Normalize whitespace by collapsing multiple spaces into a single space and trimming

	return name
}

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

func HasImdbidTags(input string) bool {
	count := regexp.MustCompile(`imdbid-`).FindAllStringIndex(input, -1)
	return len(count) == 2
}

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

func SeriesSeason(torrentName string) string {
	name := strings.ReplaceAll(torrentName, ".", " ")
	season := regexp.MustCompile(`[Ss][0-9]{2}`).FindString(name)
	if season != "" {
		return fmt.Sprintf("Season %s", season)
	}
	return season
}

func ParseUndesiredExtentions(raw string) map[string]bool {

	values := make(map[string]bool)
	rawTrimed := strings.Trim(raw, "[]")

	for _, item := range strings.Split(rawTrimed, ",") {
		n := strings.Trim(item, " ")
		values[n] = true
	}

	return values
}

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
