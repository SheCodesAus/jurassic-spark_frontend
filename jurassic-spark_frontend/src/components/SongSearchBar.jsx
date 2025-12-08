import React, { useState } from "react";
import { getSpotifyClientCredentialAccessToken } from "../services/spotifyAuth";

const SongSearchBar = ({ onSongSelect, placeholder = "Type song or artist..." }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [status, setStatus] = useState("");

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const token = await getSpotifyClientCredentialAccessToken();
      const resp = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Search failed: ${text}`);
      }
      const data = await resp.json();
      const tracks = data.tracks?.items || [];
      const results = tracks.map((track) => ({
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        id: track.id,
        uri: track.uri,
        album: track.album?.name,
        image: track.album?.images?.[0]?.url || ""
      }));
      setSearchResults(results);
      setShowDropdown(true);
      setStatus("");
    } catch (err) {
      setStatus("Error searching Spotify tracks.");
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectSong = (song) => {
    setSearchTerm(`${song.title} by ${song.artist}`);
    setSearchResults([]);
    setShowDropdown(false);
    if (onSongSelect) onSongSelect(song);
  };

  return (
    <div className="form-group search-bar-group">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && searchResults.length > 0 && (
        <ul className="search-dropdown">
          {searchResults.map((song, idx) => (
            <li
              key={song.id || idx}
              onClick={() => handleSelectSong(song)}
              className="search-dropdown-item"
            >
              {song.image && (
                <img src={song.image} alt="album cover" style={{ width: "32px", height: "32px", borderRadius: "4px", marginRight: "0.5rem" }} />
              )}
              <span className="song-title">{song.title}</span>
              <span className="song-artist">by {song.artist}</span>
              {song.album && (
                <span className="song-album"> ({song.album})</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {status && <div className="search-status" style={{ color: "#c00", marginTop: "0.5rem" }}>{status}</div>}
    </div>
  );
};

export default SongSearchBar;
