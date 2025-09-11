package qbittorrent

import (
	"encoding/json"
	"fmt"
	config "helperr/Services/Config"
	logs "helperr/Services/Logs"
	"helperr/Services/utils"
	"helperr/types"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
)

type QbitWrapper struct {
	types.QBittorrentClient
}

// QBittorrentClient creates a new QBittorrentClient.
// Parameters:
//   - values: QBittorrentClient struct containing client configuration.
//
// Returns:
//   - *QbitWrapper: A pointer to the new QbitWrapper.
func QBittorrentClient(values types.QBittorrentClient) *QbitWrapper {
	return &QbitWrapper{values}
}

// qbitRequest makes a request to the qBittorrent API.
// Parameters:
//   - method: HTTP method (GET, POST, etc.).
//   - url: API endpoint URL.
//   - body: Request body (io.Reader).
//
// Returns:
//   - body: The response body as a byte slice.
//   - error: An error if the request fails.
func (qbit *QbitWrapper) qbitRequest(method, url string, body io.Reader) ([]byte, error) {

	request, error := http.NewRequest(method, qbit.BaseURL+url, body)
	if error != nil {
		return nil, error
	}
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.AddCookie(qbit.Cookie)

	response, error := qbit.Client.Do(request)
	if error != nil {
		return nil, error
	}

	responseBody, error := io.ReadAll(response.Body)
	if error != nil {
		return nil, error
	}
	defer response.Body.Close()

	return responseBody, nil
}

// Login authenticates with the qBittorrent API.
// Parameters:
//   - username: qBittorrent username.
//   - password: qBittorrent password.
//
// Returns:
//   - error: An error if authentication fails.
func (qbit *QbitWrapper) Login(username, password string) *QbitWrapper {
	data := url.Values{}
	data.Set("username", username)
	data.Set("password", password)

	request, error := http.NewRequest("POST", qbit.BaseURL+"/api/v2/auth/login", strings.NewReader(data.Encode()))
	if error != nil {
		panic(error.Error())
	}

	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.AddCookie(qbit.Cookie)

	response, error := qbit.Client.Do(request)
	if error != nil {
		panic(error.Error())
	}

	qbit.Cookie = response.Cookies()[0]
	return qbit
}

// List retrieves a list of torrents from qBittorrent.
// Parameters:
//   - None
//
// Returns:
//   - []types.Torrents: A slice of Torrents structs.
//   - error: An error if the request fails.
func (qbit *QbitWrapper) List() ([]types.Torrent, error) {

	var data []types.Torrent

	body, err := qbit.qbitRequest("GET", "/api/v2/torrents/info", nil)

	err = json.Unmarshal(body, &data)
	if err != nil {
		return data, err
	}

	filtered := qbit.RemoveUndesiredExtentions(data)
	filtered = utils.FilteredTorrentList(filtered)

	return filtered, nil
}

// GetAPIVersion retrieves the qBittorrent Web API version.
// Parameters:
//   - None
//
// Returns:
//   - string: The qBittorrent Web API version.
//   - error: An error if the request fails.
func (qbit *QbitWrapper) GetAPIVersion() (string, error) {
	body, err := qbit.qbitRequest("GET", "/api/v2/app/webapiVersion", nil)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// RenameTorrent renames a torrent in qBittorrent.
// Parameters:
//   - hash: The hash of the torrent to rename.
//   - name: The new name for the torrent.
//
// Returns:
//   - error: An error if the request fails.
func (qbit *QbitWrapper) RenameTorrent(hash, name string) error {
	data := url.Values{}
	data.Set("hash", hash)
	data.Set("name", name)

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/rename", strings.NewReader(data.Encode()))
	return err
}

// RelocateTorrent relocates a torrent's data in qBittorrent.
// Parameters:
//   - hash: The hash of the torrent to relocate.
//   - location: The new location for the torrent's data.
//
// Returns:
//   - error: An error if the request fails.
func (qbit *QbitWrapper) RelocateTorrent(hash, location string) error {
	data := url.Values{}
	data.Set("hashes", hash)
	data.Set("location", location)

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/setLocation", strings.NewReader(data.Encode()))
	return err
}

// RelocateTorrents relocates multiple torrents' data in qBittorrent.
// Parameters:
//   - hashes: A slice of torrent hashes to relocate.
//   - location: The new location for the torrents' data.
//
// Returns:
//   - error: An error if the request fails.
func (qbit *QbitWrapper) RelocateTorrents(hashes []string, location string) error {
	data := url.Values{}
	data.Set("hashes", strings.Join(hashes, "|"))
	data.Set("location", location)

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/setLocation", strings.NewReader(data.Encode()))
	return err
}

// TorrentsContents retrieves the contents of a torrent from qBittorrent.
// Parameters:
//   - hash: The hash of the torrent.
//
// Returns:
//   - torrentContents: A slice of TorrentContents structs.
//   - error: An error if the request fails.
func (qbit *QbitWrapper) TorrentsContents(hash string) ([]types.TorrentContent, error) {
	var torrentContents []types.TorrentContent

	data := url.Values{}
	data.Set("hash", hash)

	body, err := qbit.qbitRequest("POST", "/api/v2/torrents/files", strings.NewReader(data.Encode()))
	if err != nil {
		return torrentContents, err
	}

	err = json.Unmarshal(body, &torrentContents)
	if err != nil {
		return torrentContents, err
	}

	return torrentContents, nil
}

// RenameFile renames a file within a torrent in qBittorrent.
// Parameters:
//   - hash: The hash of the torrent.
//   - oldPath: The old path of the file.
//   - newPath: The new path for the file.
//
// Returns:
//   - error: An error if the request fails.
func (qbit *QbitWrapper) RenameFile(hash, oldPath, newPath string) error {
	data := url.Values{}
	data.Set("hash", hash)
	data.Set("oldPath", oldPath)
	data.Set("newPath", newPath)

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/renameFile", strings.NewReader(data.Encode()))
	return err
}

// RenameFolder renames a folder within a torrent in qBittorrent.
// Parameters:
//   - hash: The hash of the torrent.
//   - oldPath: The old path of the folder.
//   - newPath: The new path for the folder.
//
// Returns:
//   - error: An error if the request fails.
func (qbit *QbitWrapper) RenameFolder(hash, oldPath, newPath string) error {
	data := url.Values{}
	data.Set("hash", hash)
	data.Set("oldPath", oldPath)
	data.Set("newPath", newPath)

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/renameFolder", strings.NewReader(data.Encode()))
	return err
}

func (qbit *QbitWrapper) DeleteTorrents(hashes []string, deleteFiles bool) error {
	data := url.Values{}
	data.Set("hashes", strings.Join(hashes, "|"))
	data.Set("deleteFiles", strconv.FormatBool(deleteFiles))

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/delete", strings.NewReader(data.Encode()))
	return err
}

func (qbit *QbitWrapper) DeleteTorrent(hash string, deleteFiles bool) error {
	data := url.Values{}
	data.Set("hashes", hash)
	data.Set("deleteFiles", strconv.FormatBool(deleteFiles))

	_, err := qbit.qbitRequest("POST", "/api/v2/torrents/delete", strings.NewReader(data.Encode()))
	return err
}

func (qbit *QbitWrapper) RemoveUndesiredExtentions(
	torrents []types.Torrent,
) []types.Torrent {

	if len(config.Env.UndesiredExtentions) == 0 {
		return torrents
	}

	var filteredTorrents []types.Torrent

	for _, torrent := range torrents {
		torrentContents, error := qbit.TorrentsContents(torrent.Hash)
		if error != nil {
			continue
		}
		remove := false
		file_name := ""
		for _, file := range torrentContents {
			ext := filepath.Ext(file.Name)
			if config.Env.UndesiredExtentions[ext] {
				file_name = file.Name
				remove = true
				break
			}
		}

		if remove {
			log := fmt.Sprintf(`unwanted extention found | Removing Torrent %s`, file_name)
			logs.TimeLogs("torrent", false, log, true)
			qbit.DeleteTorrent(torrent.Hash, true)
		} else {
			filteredTorrents = append(filteredTorrents, torrent)
		}
	}

	return filteredTorrents
}
