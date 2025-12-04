import React, { useEffect, useState } from 'react';
import { getAccessToken, login } from '../services/spotifyAuth';
import SpotifyPlayer from '../components/SpotifyPlayer';
import '../pages/LoginPage.css';

// Dummy userId for demo; replace with real user auth
const userId = 'demo-owner-id';

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

    // Helper: Save playlist to Spotify and open it
    async function handleSaveToSpotify(playlist) {
        try {
            // You need to implement the actual upload logic here
            // For demo, just open the playlist in Spotify
            if (playlist.external_urls && playlist.external_urls.spotify) {
                window.open(playlist.external_urls.spotify, '_blank');
            } else {
                alert('No Spotify URL found for this playlist.');
            }
        } catch (err) {
            alert('Failed to save playlist to Spotify.');
        }
    }

    // Add a mock playlist for testing
    const mockPlaylist = {
        id: 'mock123',
        name: 'Test Playlist',
        description: 'A playlist for testing the Save to Spotify button.',
        images: [{ url: '/src/assets/VibeLab.png' }],
        vibe: 'Pop',
        tracks: {
            items: [
                { track: { id: '1', name: 'Test Song', artists: [{ name: 'Test Artist' }] } }
            ]
        },
        owner: { id: userId },
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' }
    };

    return (
        <div className="login-page">
            <main className="login-main">
                <div className="login-container">
                    <h2 className="login-header logo-text">My Playlists</h2>
                    {/* Mock playlist card for testing */}
                    <div key={mockPlaylist.id} style={{
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
                            <img src={mockPlaylist.images?.[0]?.url} alt="Playlist" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#5A2FCF" }}>{mockPlaylist.name}</h3>
                                <p style={{ margin: 0, color: "#888" }}>Vibe: {mockPlaylist.vibe}</p>
                            </div>
                        </div>
                        <p style={{ marginTop: "1rem", color: "#333" }}><strong>Description:</strong> {mockPlaylist.description}</p>
                        <div style={{ marginTop: "1rem" }}>
                            <strong>Songs:</strong>
                            <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
                                {mockPlaylist.tracks.items.map((item, idx) => (
                                    <li key={item.track.id || idx}>
                                        {item.track.name} - {item.track.artists.map(a => a.name).join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                            <button
                                className="btn btn-orange"
                                style={{ padding: "0.5rem 1rem" }}
                                onClick={() => {
                                    if (!token) {
                                        login();
                                    } else {
                                        handleSaveToSpotify(mockPlaylist);
                                    }
                                }}
                            >
                                Save to Spotify
                            </button>
                        </div>
                    </div>
                    {/* Render all playlists */}
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
                            {playlist.owner?.id === userId && (
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
                    {/* ...existing code for playlists rendering... */}
                </div>
            </main>
        </div>
    );
};

export default MyPlaylists;
