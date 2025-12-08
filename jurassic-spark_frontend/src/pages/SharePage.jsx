import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSharedPlaylist, validateShareAccess } from "../services/playlistService";
import { getSpotifyClientCredentialAccessToken } from "../services/spotifyAuth";
import "./SharePage.css";

/**
 * SharePage - public access via token + password
 *
 * Visitors do NOT need to be logged in. They only need the share token (URL) and the password.
 * - GET  /api/playlists/share/<token>/        -> returns minimal metadata (public)
 * - POST /api/playlists/share/validate/      -> { share_token, accessCode } -> returns full playlist
 * - POST /api/playlists/playlist-items/add/  -> add song; includes accessCode in body for permission
 */

export default function SharePage() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [playlist, setPlaylist] = useState(null);
    const [meta, setMeta] = useState(null); // { id, title, creator, requires_password }
    const [error, setError] = useState(null);
    const [validating, setValidating] = useState(false);

    // Add-song form state
    const [adding, setAdding] = useState(false);
    const [newSpotifyId, setNewSpotifyId] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newArtist, setNewArtist] = useState("");
    const [newAlbum, setNewAlbum] = useState("");
    const [addError, setAddError] = useState("");
    const [addSuccess, setAddSuccess] = useState("");

    // Spotify search state for adding songs
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchStatus, setSearchStatus] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);

    const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;

    useEffect(() => {
        let mounted = true;

        async function loadSharedPlaylist() {
            setLoading(true);
            setError(null);

            try {
                const metaData = await getSharedPlaylist(token); // public metadata
                if (!mounted) return;

                setMeta(metaData);
                setRequiresPassword(Boolean(metaData?.requires_password));

                // If we previously saved a password for this playlist, try auto-unlock
                const stored = metaData?.id ? localStorage.getItem(`playlist_access_${metaData.id}`) : null;
                if (stored) {
                    setPassword(stored);
                    await attemptValidate(stored, metaData.id, false);
                }
            } catch (err) {
                console.error("Failed to load shared playlist metadata:", err);
                if (!mounted) return;
                setError(err?.message || "Invalid or expired share link.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadSharedPlaylist();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Validate password and fetch full playlist (no auth header required)
    async function attemptValidate(accessCode, playlistId = null, remember = true) {
        setValidating(true);
        setError(null);
        try {
            // validateShareAccess (from services) calls POST /api/playlists/share/validate/
            const data = await validateShareAccess(token, accessCode);
            // On success, backend returns full PlaylistSerializer data
            setPlaylist(data);

            if (remember && data?.id) {
                localStorage.setItem(`playlist_access_${data.id}`, accessCode);
            }

            // Clear add-song messages
            setAddError("");
            setAddSuccess("");
        } catch (err) {
            console.error("Validate access error:", err);
            setError(err?.message || "Invalid password");
            setPlaylist(null);
        } finally {
            setValidating(false);
        }
    }

    async function handleValidateClick() {
        if (!password) {
            setError("Please enter the playlist password.");
            return;
        }
        await attemptValidate(password, meta?.id, true);
    }

    async function handleSearchChange(e) {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedSong(null);
        setAddError("");
        setAddSuccess("");

        if (value.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            setSearchStatus("");
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
                id: track.id,
                title: track.name,
                artist: track.artists.map((a) => a.name).join(", "),
                album: track.album?.name || "Unknown album",
                image: track.album?.images?.[0]?.url || "",
            }));

            setSearchResults(results);
            setShowDropdown(true);
            setSearchStatus("");
        } catch (err) {
            console.error("Spotify search error:", err);
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
        setAddError("");
        setAddSuccess("");
    }


    // Add song: include accessCode in body so the backend permission allows anonymous adds with correct password
    async function handleAddSong(e) {
        e.preventDefault();
        setAddError("");
        setAddSuccess("");

        if (!playlist?.id) {
            setAddError("Playlist not loaded.");
            return;
        }

        if (!selectedSong) {
            setAddError("Playlist not loaded.");
        }
        

        const accessCode = password || localStorage.getItem(`playlist_access_${playlist.id}`) || "";
        if (!accessCode) {
            setAddError("Missing playlist password. Unlock playlist first.");
            return;
        }

        setAdding(true);
        try {
            // Note: we intentionally do NOT require an Authorization header here.
            const headers = { "Content-Type": "application/json" };
            const body = {
                playlist_id: playlist.id,
                spotify_id: selectedSong.id,
                title: selectedSong.title || "",
                artist: selectedSong.artist || "",
                album: selectedSong.album || "Unknown",
                accessCode,
            };

            const resp = await fetch(`${apiBaseUrl}/api/playlists/playlist-items/add/`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });

            const text = await resp.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (err) {
                data = text;
            }

            if (!resp.ok) {
                const msg = (data && (data.detail || data.message)) || text || resp.statusText;
                throw new Error(msg || "Failed to add song");
            }

            // Success — append returned item to UI list
            const createdItem = data;
            setPlaylist((prev) => {
                if (!prev) return prev;
                const items = Array.isArray(prev.items) ? [...prev.items, createdItem] : [createdItem];
                return { ...prev, items };
            });

            setAddSuccess("Song added!");
            setSelectedSong(null);
            setSearchTerm(""),
            setSearchResults([]);
            setShowDropdown(false);

        } catch (err) {
            console.error("Add song error:", err);
            setAddError(err?.message || "Failed to add song. Check password and try again.");
        } finally {
            setAdding(false);
        }
    }

    if (loading) return <p>Loading…</p>;
    if (error && !meta) return <p style={{ color: "red" }}>{error}</p>;

    // Render unlocked playlist + add-song form
    if (playlist) {
        return (
            <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
                <h1 style={{ marginBottom: 8 }}>{playlist.name}</h1>
                <p style={{ marginTop: 0, color: "#666" }}>Created by: {playlist.owner?.username || "Unknown"}</p>

                <div style={{ marginTop: "1.5rem" }}>
                    <strong>Description:</strong>
                    <p>{playlist.description || "No description."}</p>
                </div>

                <div className="share-songs-section" style={{ marginTop: "1rem" }}>
                    <h3>Songs</h3>
                    {playlist.items && playlist.items.length ? (
                        <ol className="share-songs-list">
                            {playlist.items.map((item) => (
                                <li key={item.id} style={{ marginBottom: 6 }}>
                                    {item.song?.title || item.title || "Untitled"} —{" "}
                                    <small style={{ color: "#666" }}>{item.song?.artist || item.artist}</small>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p>No songs yet.</p>
                    )}
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                    <h3>Add a song</h3>
                    <p style={{ marginTop: 0, color: "#666" }}>
                        Provide a Spotify track ID or the title/artist. The playlist password will be sent to the server to authorize the add.
                    </p>
                <form className="share-add-form" onSubmit={handleAddSong} style={{ marginTop: 12 }}>
                    <label style={{ display: "block", marginBottom: 6 }}>Search for a song</label>
                    <input
                        type="text"
                        className="share-search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Type song or artist name…"
                        style={{ width: "100%", padding: "0.6rem", boxSizing: "border-box" }}
                        autoComplete="off"
                    />

                    {searchStatus && (
                        <div style={{ marginTop: 4, color: "red", fontSize: "0.85rem" }}>
                            {searchStatus}
                        </div>
                    )}

                    {showDropdown && searchResults.length > 0 && (
                        <ul className="share-results-list">
                            {searchResults.map((song) => (
                                <li
                                    key={song.id}
                                    className="share-results-item"
                                    onClick={() => handleSelectSong(song)}
                                    style={{
                                        padding: "0.4rem 0.6rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    {song.image && (
                                        <img
                                            src={song.image}
                                            alt="album cover"
                                            style={{ width: 32, height: 32, borderRadius: 4 }}
                                        />
                                    )}
                                    <div>
                                        <div className="share-results-item-title">{song.title}</div>
                                        <div className="share-results-item-meta">{song.artist}{song.album ? ` • ${song.album}` : ""}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {selectedSong && (
                        <div style={{ marginTop: 8, fontSize: "0.9rem", color: "#333" }}>
                            Selected: <strong>{selectedSong.title}</strong> — {selectedSong.artist}
                        </div>
                    )}

                    {addError && <div className="share-add-form-status error">{addError}</div>}
                    {addSuccess && <div className="share-add-form-status success">{addSuccess}</div>}

                    <div style={{ marginTop: 10 }}>
                        <button
                            type="submit"
                            disabled={adding || !selectedSong}
                            className="btn btn-primary"
                            style={{ padding: "0.6rem 1rem" }}
                        >
                            {adding ? "Adding…" : "Add Song"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="btn btn-ghost"
                            style={{ marginLeft: 8, padding: "0.6rem 1rem" }}
                        >
                            Back to Home
                        </button>
                    </div>
                </form>
                </div>
            </div>
        );
    }

    // Default view: metadata + password gate
    return (
        <div style={{ maxWidth: 420, margin: "4rem auto", padding: "0 1rem" }}>
            <h1 style={{ fontSize: "1.25rem" }}>{meta?.title || "Shared Playlist"}</h1>
            <p style={{ marginTop: 4, color: "#666" }}>Created by: {meta?.creator || "Unknown"}</p>

            {requiresPassword ? (
                <>
                    <p style={{ marginTop: 12, color: "#333" }}>This playlist requires a password to view. Enter the password below to unlock.</p>

                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter playlist password" style={{ width: "100%", padding: "0.6rem", marginTop: "0.75rem", boxSizing: "border-box" }} onKeyDown={(e) => { if (e.key === "Enter") handleValidateClick(); }} />

                    {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}

                    <button onClick={handleValidateClick} style={{ marginTop: "1rem", width: "100%", padding: "0.6rem" }} disabled={validating}>
                        {validating ? "Unlocking…" : "Unlock Playlist"}
                    </button>
                </>
            ) : (
                <>
                    <p style={{ marginTop: 12 }}>This playlist can be viewed without a password.</p>
                    <button onClick={() => attemptValidate("", meta?.id, false)} style={{ marginTop: 8 }} className="btn">View Playlist</button>
                </>
            )}
        </div>
    );
}