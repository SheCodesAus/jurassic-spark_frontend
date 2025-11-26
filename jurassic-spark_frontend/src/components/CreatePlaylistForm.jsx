import React from "react";
import { Link } from "react-router-dom";
import vibelabLogo from "../assets/VibeLab.png";
import "./CreatePlaylistForm.css";

const vibes = ["Country", "Latin", "Pop", "R&B", "Rock", "Techno"];

// Mock songs for dropdown results
const MOCK_SONGS = [
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Shape of You", artist: "Ed Sheeran" },
  { title: "Levitating", artist: "Dua Lipa" },
  { title: "Peaches", artist: "Justin Bieber" },
  { title: "Stay", artist: "The Kid LAROI" },
];

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

  // Mock search function
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) {
      // Filter mock songs by title or artist
      const results = MOCK_SONGS.filter(
        (song) =>
          song.title.toLowerCase().includes(value.toLowerCase()) ||
          song.artist.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
      setShowDropdown(true);
    } else {
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
          <select
            id="vibe"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            required
          >
            <option value="">Select Vibe</option>
            {vibes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span className="custom-arrow"></span>
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
                  key={idx}
                  onClick={() => handleSelectSong(song)}
                  className="search-dropdown-item"
                >
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">by {song.artist}</span>
                </li>
              ))}
            </ul>
          )}
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