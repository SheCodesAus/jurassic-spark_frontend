import React from "react";
import vibelabLogo from "../assets/VibeLab.png";
import "./CreatePlaylistForm.css";

const vibes = ["Country", "Latin", "Pop", "R&B", "Rock", "Techno"];

const CreatePlaylistForm = () => {
  const [playlistName, setPlaylistName] = React.useState("");
  const [playlistDesc, setPlaylistDesc] = React.useState("");
  const [vibe, setVibe] = React.useState("");
  const [songTitle, setSongTitle] = React.useState("");
  const [artistName, setArtistName] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClear = () => {
    setPlaylistName("");
    setPlaylistDesc("");
    setVibe("");
    setSongTitle("");
    setArtistName("");
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
        <div className="form-group">
          <label htmlFor="songTitle">Song Title</label>
          <input
            type="text"
            id="songTitle"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="Enter song title..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="artistName">Artist Name</label>
          <input
            type="text"
            id="artistName"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Enter artist name..."
          />
        </div>
        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary login-btn mb-3"
            disabled={
              !playlistName.trim() ||
              !vibe.trim() ||
              (!songTitle.trim() && !artistName.trim())
            }
          >
            All Done!
          </button>
          <button
            type="button"
            className="btn btn-orange"
            onClick={handleClear}
          >
            Back to the Menu
          </button>
        </div>
      </form>
      {submitted && (
        <div className="playlist-summary" style={{marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "0.5rem"}}>
          <h2>Playlist Summary</h2>
          <p><strong>Name:</strong> {playlistName}</p>
          <p><strong>Description:</strong> {playlistDesc}</p>
          <p><strong>Vibe:</strong> {vibe}</p>
          <p><strong>Song:</strong> {songTitle} {artistName && <>by {artistName}</>}</p>
        </div>
      )}
    </div>
  );
};

export default CreatePlaylistForm;