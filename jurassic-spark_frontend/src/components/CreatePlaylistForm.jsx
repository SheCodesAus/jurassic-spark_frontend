
import React from "react";
import { Link } from "react-router-dom";
import vibelabLogo from "../assets/VibeLab.png";
import "./CreatePlaylistForm.css";
import { getSpotifyClientCredentialAccessToken } from "../services/spotifyAuth";

const vibes = ["Country", "Latin", "Pop", "R&B", "Rock", "Techno"];

const CreatePlaylistForm = () => {
  const [playlistName, setPlaylistName] = React.useState("");
  const [playlistDesc, setPlaylistDesc] = React.useState("");
  const [vibe, setVibe] = React.useState("");
  const [selectedSong, setSelectedSong] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [status, setStatus] = React.useState("");

  // Remove user token, use client credentials for search

  // Real Spotify search function
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

  // Select a song from dropdown
  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setSearchTerm(`${song.title} by ${song.artist}`);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClear = () => {
    setPlaylistName("");
    setPlaylistDesc("");
    setVibe("");
    setSelectedSong(null);
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setSubmitted(false);
  };

  // Custom dropdown state
  const [showVibeDropdown, setShowVibeDropdown] = React.useState(false);
  return (
    <div className="card login-card">
      <div className="logo-container">
        <img src={vibelabLogo} alt="VibeLab Logo" className="form-logo" />
        <h2 className="text-center mb-2">Create a Playlist</h2>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="playlistName">Playlist Name</label>
          <input
            type="text"
            id="playlistName"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="playlistDesc">Playlist Description</label>
          <textarea
            id="playlistDesc"
            value={playlistDesc}
            onChange={(e) => setPlaylistDesc(e.target.value)}
            placeholder="Enter playlist description..."
            rows={2}
          />
        </div>
        <div className="form-group select-vibe-group">
          <label htmlFor="vibe">Select the Vibe</label>
          <div className="custom-dropdown">
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => setShowVibeDropdown((prev) => !prev)}
              style={{
                width: "100%",
                padding: "0.7rem 0.8rem",
                borderRadius: "1rem",
                border: "1.5px solid #e3e3e3",
                background: "#f7f7fa",
                color: "#333",
                fontWeight: 600,
                fontSize: "1rem",
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              {vibe ? vibe : "Select Vibe"}
              <span className="custom-arrow" style={{ float: "right" }}></span>
            </button>
            {showVibeDropdown && (
              <ul className="dropdown-menu">
                {vibes.map((v) => (
                  <li
                    key={v}
                    className={`dropdown-item${vibe === v ? " selected" : ""}`}
                    onClick={() => {
                      setVibe(v);
                      setShowVibeDropdown(false);
                    }}
                  >
                    {v}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Search bar for song */}
        <div className="form-group search-bar-group">
          <label htmlFor="searchSong">Search for a Song</label>
          <input
            type="text"
            id="searchSong"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Type song or artist..."
            autoComplete="off"
          />
          {/* Dropdown results */}
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
        <div className="button-group">
          <button
            type="submit"
            className="btn btn-orange login-btn mb-3"
            disabled={
              !playlistName.trim() ||
              !vibe.trim() ||
              !selectedSong
            }
          >
            All Done!
          </button>
        </div>
      </form>
      <Link to="/" className="back-home-link">Back to the Home</Link>
      {submitted && (
        <div className="playlist-summary" style={{marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "0.5rem"}}>
          <h2>Playlist Summary</h2>
          <p><strong>Name:</strong> {playlistName}</p>
          <p><strong>Description:</strong> {playlistDesc}</p>
          <p><strong>Vibe:</strong> {vibe}</p>
          <p>
            <strong>Song:</strong>{" "}
            {selectedSong
              ? `${selectedSong.title} by ${selectedSong.artist}`
              : "None"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreatePlaylistForm;