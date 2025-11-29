import React, { useEffect, useState } from 'react';
import { getAccessToken, login } from '../services/spotifyAuth';
import SpotifyPlayer from '../components/SpotifyPlayer';
import '../pages/LoginPage.css';

const MyPlaylists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const token = getAccessToken();

    useEffect(() => {
        if (token) {
            fetchPlaylists();
        }
    }, [token]);

    async function fetchPlaylists() {
        if (!token) {
            setError("Please log in with Spotify first.");
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!resp.ok) {
                throw new Error(`Failed to fetch playlists: ${resp.statusText}`);
            }

            const data = await resp.json();
            setPlaylists(data.items || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load playlists. Try again.");
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    }
    // Real Spotify search state for the card
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [searchStatus, setSearchStatus] = useState("");

    async function handleSearch(e) {
        const value = e.target.value;
        setSearchTerm(value);

        if (!token) {
            setSearchStatus("Please log in with Spotify first.");
            setShowDropdown(false);
            return;
        }

        if (value.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        try {
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
                image: track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || ""
            }));
            setSearchResults(results);
            setShowDropdown(true);
            setSearchStatus("");
        } catch (err) {
            setSearchStatus("Error searching Spotify tracks.");
            setSearchResults([]);
            setShowDropdown(false);
        }
    }

    function handleSelectSong(song) {
        setSelectedSong(song);
        setSearchTerm(`${song.title} by ${song.artist}`);
        setSearchResults([]);
        setShowDropdown(false);
    }

    return (
        <div className="login-page">
            <main className="login-main">
                <div className="login-container">
                    <h2 className="login-header logo-text">My Playlists</h2>
                    {/* Mock playlist card for styling */}
                    <div style={{
                        border: "2px solid #5A2FCF",
                        borderRadius: "1rem",
                        background: "#fff",
                        boxShadow: "0 4px 16px rgba(90,47,207,0.08)",
                        padding: "2rem",
                        marginBottom: "2rem",
                        maxWidth: "420px",
                        margin: "0 auto 2rem auto"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <img src="/src/assets/VibeLab.png" alt="Vibe Logo" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#5A2FCF" }}>VibeLab Vibes</h3>
                                <p style={{ margin: 0, color: "#888" }}>Vibe: Pop</p>
                            </div>
                        </div>
                        <p style={{ marginTop: "1rem", color: "#333" }}><strong>Description:</strong> My favorite pop tracks for coding!</p>
                        <div style={{ marginTop: "1rem" }}>
                            <strong>Songs:</strong>
                            <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
                                <li>Blinding Lights - The Weeknd</li>
                                <li>Levitating - Dua Lipa</li>
                                <li>Shape of You - Ed Sheeran</li>
                            </ul>
                        </div>
                        {/* Search bar and dropdown above Add Song button */}
                        <div style={{ marginTop: "1rem", position: "relative" }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search for a song..."
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc" }}
                            />
                            {showDropdown && searchResults.length > 0 && (
                                <ul style={{
                                    position: "absolute",
                                    top: "2.5rem",
                                    left: 0,
                                    width: "100%",
                                    background: "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: "0.25rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    zIndex: 10,
                                    listStyle: "none",
                                    margin: 0,
                                    padding: 0
                                }}>
                                    {searchResults.map((song, idx) => (
                                        <li
                                            key={song.id || idx}
                                            onClick={() => handleSelectSong(song)}
                                            style={{ padding: "0.5rem 1rem", cursor: "pointer", borderBottom: "1px solid #eee", display: "flex", alignItems: "center" }}
                                        >
                                            {song.image && (
                                                <img src={song.image} alt="album cover" style={{ width: "32px", height: "32px", borderRadius: "4px", marginRight: "0.5rem" }} />
                                            )}
                                            <span style={{ fontWeight: 600 }}>{song.title}</span> <span style={{ color: "#888", marginLeft: "0.5rem" }}>by {song.artist}</span>
                                            {song.album && (
                                                <span style={{ color: "#aaa", marginLeft: "0.5rem" }}>({song.album})</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {searchStatus && <div style={{ color: "#c00", marginTop: "0.5rem" }}>{searchStatus}</div>}
                        </div>
                        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                            <button className="btn btn-orange" style={{ padding: "0.5rem 1rem" }}>Add Song</button>
                        </div>
                    </div>
                    {/* ...existing code for playlists rendering... */}
                </div>
            </main>
        </div>
    );
};

export default MyPlaylists;
