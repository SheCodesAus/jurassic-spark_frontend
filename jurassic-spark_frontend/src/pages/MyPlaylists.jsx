import React, { useEffect, useState } from 'react';
import { getAccessToken, login } from '../services/spotifyAuth';
import SpotifyPlayer from '../components/SpotifyPlayer';
import '../pages/LoginPage.css';

// Remove top-level userId, get it inside useEffect

const MyPlaylists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const token = getAccessToken();

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        console.log('[MyPlaylists] user_id from localStorage:', userId);
        if (!userId || userId === 'undefined') {
            setError('No user ID found. Please log in again.');
            setPlaylists([]);
            return;
        }
        fetchPlaylists(userId);
    }, []);

    async function fetchPlaylists(userId) {
        setLoading(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;
            const resp = await fetch(`${apiBaseUrl}/api/playlists/user/${userId}/`);
            if (!resp.ok) {
                throw new Error(`Failed to fetch playlists: ${resp.statusText}`);
            }
            const data = await resp.json();
            setPlaylists(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load playlists. Try again.");
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    }

    // Expose refresh function globally for PlaylistCreator
    window.onPlaylistCreated = fetchPlaylists;
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

    // Helper: Save playlist to Spotify and open it
    // ...existing code...
                    {/* Render all playlists */}
                    {/* Show message if no playlists and not loading/error */}
                    {!loading && !error && playlists.length === 0 && (
                        <p>No playlists found. Try creating one!</p>
                    )}
                    {playlists.map((playlist) => (
                        <div key={playlist.id} style={{
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
                                <img src={playlist.images?.[0]?.url || "/src/assets/VibeLab.png"} alt="Playlist" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#5A2FCF" }}>{playlist.name}</h3>
                                    <p style={{ margin: 0, color: "#888" }}>Vibe: {playlist.vibe || 'Unknown'}</p>
                                </div>
                            </div>
                            <p style={{ marginTop: "1rem", color: "#333" }}><strong>Description:</strong> {playlist.description || 'No description.'}</p>
                            <div style={{ marginTop: "1rem" }}>
                                <strong>Songs:</strong>
                                <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
                                    {playlist.tracks?.items?.map((item, idx) => (
                                        <li key={item.track?.id || idx}>
                                            {item.track?.name} - {item.track?.artists?.map(a => a.name).join(', ')}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Save to Spotify button, only for owner */}
                            {/* Only show button if playlist.owner?.id matches localStorage user_id */}
                            {playlist.owner?.id === localStorage.getItem('user_id') && (
                                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                                    <button
                                        className="btn btn-orange"
                                        style={{ padding: "0.5rem 1rem" }}
                                        onClick={() => handleSaveToSpotify(playlist)}
                                    >
                                        Save to Spotify
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

};

export default MyPlaylists;
