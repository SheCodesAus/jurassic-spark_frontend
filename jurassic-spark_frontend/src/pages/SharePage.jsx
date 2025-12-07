import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSharedPlaylist, validateShareAccess } from "../services/playlistService";

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

    // Add song: include accessCode in body so the backend permission allows anonymous adds with correct password
    async function handleAddSong(e) {
        e.preventDefault();
        setAddError("");
        setAddSuccess("");

        if (!newTitle.trim() && !newSpotifyId.trim()) {
            setAddError("Provide at least a Spotify ID or a title.");
            return;
        }
        if (!playlist?.id) {
            setAddError("Playlist not loaded.");
            return;
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
                spotify_id: newSpotifyId || null,
                title: newTitle || "",
                artist: newArtist || "",
                album: newAlbum || "",
                accessCode, // backend's HasPlaylistAccess checks request.data.get('accessCode')
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
            setNewSpotifyId("");
            setNewTitle("");
            setNewArtist("");
            setNewAlbum("");
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

                <div style={{ marginTop: "1rem" }}>
                    <h3>Songs</h3>
                    {playlist.items && playlist.items.length ? (
                        <ol>
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

                    <form onSubmit={handleAddSong} style={{ marginTop: 12 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>Spotify track ID (optional)</label>
                        <input value={newSpotifyId} onChange={(e) => setNewSpotifyId(e.target.value)} placeholder="e.g. 3n3Ppam7vgaVa1iaRUc9Lp" style={{ width: "100%", padding: "0.6rem", boxSizing: "border-box" }} />

                        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Title (optional)</label>
                        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Track title" style={{ width: "100%", padding: "0.6rem", boxSizing: "border-box" }} />

                        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Artist (optional)</label>
                        <input value={newArtist} onChange={(e) => setNewArtist(e.target.value)} placeholder="Artist name" style={{ width: "100%", padding: "0.6rem", boxSizing: "border-box" }} />

                        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Album (optional)</label>
                        <input value={newAlbum} onChange={(e) => setNewAlbum(e.target.value)} placeholder="Album name" style={{ width: "100%", padding: "0.6rem", boxSizing: "border-box" }} />

                        {addError && <div style={{ color: "red", marginTop: 8 }}>{addError}</div>}
                        {addSuccess && <div style={{ color: "green", marginTop: 8 }}>{addSuccess}</div>}

                        <div style={{ marginTop: 10 }}>
                            <button type="submit" disabled={adding} className="btn" style={{ padding: "0.6rem 1rem" }}>
                                {adding ? "Adding…" : "Add Song"}
                            </button>

                            <button type="button" onClick={() => navigate("/")} className="btn" style={{ marginLeft: 8, padding: "0.6rem 1rem" }}>
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