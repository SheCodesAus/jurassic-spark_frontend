import React, { useEffect, useState } from 'react';
import { getAccessToken, login } from '../services/spotifyAuth';
import SpotifyPlayer from '../components/SpotifyPlayer';
import '../pages/HomePage.css';

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

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
            <h1>My Playlists</h1>

            {selectedPlaylist && (
                <div style={{ marginBottom: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: "0.5rem" }}>
                    <SpotifyPlayer playlistUri={selectedPlaylist.uri} playlistName={selectedPlaylist.name} />
                    <button
                        onClick={() => setSelectedPlaylist(null)}
                        style={{
                            marginTop: "1rem",
                            padding: "0.5rem 1rem",
                            background: "#ddd",
                            border: "1px solid #999",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                        }}
                    >
                        Close Player
                    </button>
                </div>
            )}

            {!token ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Please log in with Spotify to view your playlists.</p>
                    <button
                        onClick={login}
                        className="btn btn-orange"
                        style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                    >
                        Login with Spotify
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={fetchPlaylists}
                        className="btn btn-primary"
                        style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh Playlists"}
                    </button>

                    {error && (
                        <div style={{ color: "red", padding: "1rem", marginBottom: "1rem" }}>
                            {error}
                        </div>
                    )}

                    {playlists.length === 0 && !loading && !error && (
                        <p style={{ color: "#666" }}>No playlists found. Create one to get started!</p>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                            gap: "1.5rem",
                            marginTop: "2rem",
                        }}
                    >
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "0.5rem",
                                    padding: "1rem",
                                    background: "#fff",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    cursor: "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-5px)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                }}
                                onClick={() => setSelectedPlaylist(playlist)}
                            >
                                {/* Playlist Image */}
                                {playlist.images && playlist.images.length > 0 && (
                                    <img
                                        src={playlist.images[0].url}
                                        alt={playlist.name}
                                        style={{
                                            width: "100%",
                                            height: "200px",
                                            objectFit: "cover",
                                            borderRadius: "0.25rem",
                                            marginBottom: "1rem",
                                        }}
                                    />
                                )}

                                {/* Playlist Info */}
                                <h3 style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>
                                    {playlist.name}
                                </h3>

                                <p style={{ margin: "0.5rem 0", color: "#666", fontSize: "0.9rem" }}>
                                    <strong>Tracks:</strong> {playlist.tracks.total}
                                </p>

                                {playlist.description && (
                                    <p
                                        style={{
                                            margin: "0.5rem 0",
                                            color: "#888",
                                            fontSize: "0.85rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {playlist.description}
                                    </p>
                                )}

                                <p style={{ margin: "0.5rem 0", color: "#999", fontSize: "0.8rem" }}>
                                    <strong>Owner:</strong> {playlist.owner.display_name}
                                </p>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(playlist.external_urls.spotify, '_blank');
                                    }}
                                    className="btn btn-orange"
                                    style={{
                                        width: "100%",
                                        marginTop: "1rem",
                                        padding: "0.5rem",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Open in Spotify
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyPlaylists;
