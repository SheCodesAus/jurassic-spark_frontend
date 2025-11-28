
// src/components/PlaylistCreator.jsx
import React, { useState } from "react";
import { getAccessToken } from "../services/spotifyAuth";
import { login } from "../services/spotifyAuth";
import vibelabLogo from "../assets/VibeLab.png";
import "./CreatePlaylistForm.css";

const vibes = ["Country", "Latin", "Pop", "R&B", "Rock", "Techno"];

export default function PlaylistCreator() {
    const [playlistName, setPlaylistName] = useState("");
    const [playlistDesc, setPlaylistDesc] = useState("");
    const [vibe, setVibe] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedTracks, setSelectedTracks] = useState([]);
    const [status, setStatus] = useState("");

    const token = getAccessToken();

    // --- Real Spotify search ---
    async function handleSearch(e) {
        const value = e.target.value;
        setSearchTerm(value);

        if (!token) {
        setStatus("Please log in with Spotify first.");
        setShowDropdown(false);
        return;
        }

        // Only search when at least 2 characters
        if (value.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
        }

        try {
        const resp = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            value
            )}&type=track&limit=10`,
            {
            headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Search failed: ${text}`);
        }
        const data = await resp.json();
        const items = data?.tracks?.items ?? [];
        setSearchResults(items);
        setShowDropdown(items.length > 0);
        setStatus("");
        } catch (err) {
        console.error(err);
        setStatus("Search failed. Try again.");
        setShowDropdown(false);
        }
    }

    // Add selected track (avoid duplicates)
    function handleSelectTrack(track) {
        const uri = track.uri;
        if (!selectedTracks.includes(uri)) {
        setSelectedTracks((prev) => [...prev, uri]);
        }
        setSearchTerm(`${track.name} by ${track.artists.map((a) => a.name).join(", ")}`);
        setShowDropdown(false);
    }

    function removeTrack(uri) {
        setSelectedTracks((prev) => prev.filter((t) => t !== uri));
    }

    function resetForm() {
        setPlaylistName("");
        setPlaylistDesc("");
        setVibe("");
        setSelectedTracks([]);
        setSearchTerm("");
        setSearchResults([]);
        setShowDropdown(false);
        setSubmitted(false);
        setStatus("");
    }

    // --- Create playlist & add tracks ---
    async function handleSubmit(e) {
        e.preventDefault();
        if (!token) {
        setStatus("Please log in with Spotify first.");
        return;
        }
        if (!playlistName.trim() || !vibe.trim() || selectedTracks.length === 0) {
        setStatus("Please provide name, vibe, and at least one track.");
        return;
        }

        try {
        // Get user ID
        const meResp = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meResp.json();
        const userId = meData.id;

        // Create playlist
        const playlistResp = await fetch(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: playlistName,
                description:
                playlistDesc?.trim()
                    ? playlistDesc
                    : `Vibe: ${vibe} • Created via Jurassic Spark`,
                public: false,
            }),
            }
        );
        if (!playlistResp.ok) {
            const text = await playlistResp.text();
            throw new Error(`Create playlist failed: ${text}`);
        }
        const playlistData = await playlistResp.json();
        const playlistId = playlistData.id;

        // Add tracks
        const addResp = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: selectedTracks }),
            }
        );
        if (!addResp.ok) {
            const text = await addResp.text();
            throw new Error(`Add tracks failed: ${text}`);
        }

        setSubmitted(true);
        setStatus(`Playlist "${playlistName}" created with ${selectedTracks.length} tracks!`);
        } catch (err) {
        console.error(err);
        setStatus("Failed to create playlist. Check scopes and login.");
        }
    }

    // --- If not logged in, show gentle prompt (style still loads) ---

    return (
    <div className="card login-card">
        <div className="logo-container">
        <img src={vibelabLogo} alt="VibeLab Logo" className="form-logo" />
        <h2 className="text-center mb-2">Create a Playlist in Spotify</h2>
        </div>

        {/* ✅ Conditional rendering */}
        {!token ? (
        <>
            <button onClick={login} className="btn btn-orange login-btn mb-3">
            Login with Spotify
            </button>
        </>
        ) : (
        <form onSubmit={handleSubmit} className="login-form">
            {/* ✅ Your existing form fields stay here */}
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
                <option key={v} value={v}>
                    {v}
                </option>
                ))}
            </select>
            <span className="custom-arrow"></span>
            </div>

            {/* ✅ Keep your search bar and selected tracks list */}
            <div className="form-group">
            <label htmlFor="search">Search and Add Tracks</label>
            <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search for tracks..."
                autoComplete="off"
            />
            {showDropdown && searchResults.length > 0 && (
                <div className="dropdown-list">
                {searchResults.map((track) => (
                    <div
                    key={track.id}
                    className="dropdown-item"
                    onClick={() => handleSelectTrack(track)}
                    >
                    <strong>{track.name}</strong> by{" "}
                    {track.artists.map((a) => a.name).join(", ")}
                    </div>
                ))}
                </div>
            )}
            </div>

            {/* Selected Tracks */}
            {selectedTracks.length > 0 && (
            <div className="selected-tracks">
                <h4>Selected Tracks ({selectedTracks.length})</h4>
                <ul>
                {selectedTracks.map((uri) => {
                    const track = searchResults.find((t) => t.uri === uri);
                    return (
                    <li key={uri}>
                        {track ? `${track.name} by ${track.artists.map((a) => a.name).join(", ")}` : uri}
                        <button
                        type="button"
                        onClick={() => removeTrack(uri)}
                        className="btn-remove"
                        >
                        ✕
                        </button>
                    </li>
                    );
                })}
                </ul>
            </div>
            )}

            <div className="button-group">
            <button
                type="submit"
                className="btn btn-orange login-btn mb-3"
                disabled={!playlistName.trim() || !vibe.trim() || selectedTracks.length === 0}
            >
                All Done!
            </button>
            </div>
        </form>
        )}

        {/* ✅ Status and summary stay outside */}
        {status && (
        <p style={{ padding: "0 1rem", color: "#444" }}>
            {status}
        </p>
        )}

        {submitted && (
        <div
            className="playlist-summary"
            style={{
            marginTop: "2rem",
            background: "#f9f9f9",
            padding: "1rem",
            borderRadius: "0.5rem",
            }}
        >
            <h2>Playlist Summary</h2>
            <p>
            <strong>Name:</strong> {playlistName}
            </p>
            <p>
            <strong>Description:</strong> {playlistDesc || `Vibe: ${vibe}`}
            </p>
            <p>
            <strong>Vibe:</strong> {vibe}
            </p>
            <p>
            <strong>Tracks:</strong> {selectedTracks.length}
            </p>
        </div>
        )}
    </div>
    );
}
