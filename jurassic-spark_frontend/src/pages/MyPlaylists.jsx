import React, { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../services/spotifyAuth";
import "../pages/LoginPage.css";

// Remove top-level userId, get it inside useEffect

const MyPlaylists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const token = getAccessToken();

    // share modal state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [shareError, setShareError] = useState("");
    const [copying, setCopying] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);

    // modal flow: 'input' -> show password input; 'result' -> show generated share link
    const [shareStage, setShareStage] = useState("input");
    const [sharePassword, setSharePassword] = useState("");
    const [currentPlaylistId, setCurrentPlaylistId] = useState(null);

    // ref to the input in modal to select/focus it for fallback copy
    const shareInputRef = useRef(null);


    useEffect(() => {
        fetchPlaylists();
    }, []);

    async function fetchPlaylists() {
        setLoading(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;
            const jwtToken = localStorage.getItem("jwt_token");
            const authHeaders = jwtToken
                ? { Authorization: `Bearer ${jwtToken}` }
                : {};
            const resp = await fetch(`${apiBaseUrl}/api/playlists/`, {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders,
                },
            });
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

    // Opens modal in "input password" stage
    function openShareModal(playlistId) {
        setCurrentPlaylistId(playlistId);
        setShareStage("input");
        setSharePassword("");
        setShareUrl("");
        setShareError("");
        setShowShareModal(true);
        // small timeout to focus input after render
        setTimeout(() => {
            if (shareInputRef.current) {
                shareInputRef.current.focus();
            }
        }, 60);
    }

    // Submit password inside modal and request backend to create share link
    async function submitSharePassword() {
        if (!sharePassword) {
            setShareError("Password is required.");
            return;
        }
        setShareLoading(true);
        setShareError("");
        try {
            const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;
            const jwtToken = localStorage.getItem("jwt_token");

            const resp = await fetch(
                `${apiBaseUrl}/api/playlists/${currentPlaylistId}/generate-share-link/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwtToken}`,
                    },
                    body: JSON.stringify({ accessCode: sharePassword }),
                }
            );

            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(txt || resp.statusText || "Failed to generate share link");
            }

            const data = await resp.json();
            const url =
                data.share_url ||
                (data.share_token ? `${window.location.origin}/share/${data.share_token}` : null);

            if (!url) {
                throw new Error("Share URL not returned by server");
            }

            setShareUrl(url);
            setShareStage("result");

            // focus & select the input so user can easily copy if needed
            setTimeout(() => {
                if (shareInputRef.current) {
                    shareInputRef.current.focus();
                    shareInputRef.current.select();
                }
            }, 60);
        } catch (err) {
            console.error("generate share error:", err);
            setShareError(err?.message || "Failed to generate share link");
        } finally {
            setShareLoading(false);
        }
    }

    async function handleCopyClick() {
        if (!shareUrl) return;
        setCopying(true);
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("✅ Share link copied to clipboard");
            setCopying(false);
            // optionally close modal: setShowShareModal(false);
            return;
        } catch (err) {
            console.warn("Clipboard write failed:", err);
            // fallback: select input and execCommand('copy')
            try {
                if (shareInputRef.current) {
                    shareInputRef.current.select();
                    const ok = document.execCommand("copy");
                    if (ok) {
                        alert("✅ Share link copied (fallback)");
                        setCopying(false);
                        return;
                    }
                }
                // last resort
                window.prompt("Copy this share link (Ctrl+C):", shareUrl);
            } catch (ex) {
                console.error("Fallback copy failed:", ex);
                window.prompt("Copy this share link (Ctrl+C):", shareUrl);
            } finally {
                setCopying(false);
            }
        }
    }

    function handleCloseModal() {
        setShowShareModal(false);
        setShareUrl("");
        setShareError("");
        setSharePassword("");
        setShareStage("input");
        setCurrentPlaylistId(null);
    }

    if (loading) return <div>Loading playlists...</div>;
    if (error) return <div>{error}</div>;
    if (!playlists || playlists.length === 0) return <div>No playlists yet.</div>;


    return (
        <>
        {playlists.map((playlist) => (
        <div
            key={playlist.id}
            style={{
                border: "2px solid #5A2FCF",
                borderRadius: "1rem",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(90,47,207,0.08)",
                padding: "2rem",
                marginBottom: "2rem",
                maxWidth: "420px",
                margin: "0 auto 2rem auto",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img
                    src={playlist.images?.[0]?.url || "/src/assets/VibeLab.png"}
                    alt="Playlist"
                    style={{ width: "60px", height: "60px", borderRadius: "50%" }}
                />
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#5A2FCF" }}>
                        {playlist.name}
                    </h3>
                    <p style={{ margin: 0, color: "#888" }}>
                        Vibe: {playlist.vibe || "Unknown"}
                    </p>
                </div>
            </div>
            <p style={{ marginTop: "1rem", color: "#333" }}>
                <strong>Description:</strong>{" "}
                {playlist.description || "No description."}
            </p>
            <div style={{ marginTop: "1rem" }}>
                <strong>Songs:</strong>
                <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
                {/* Prefer backend PlaylistItem model if present */}
                {Array.isArray(playlist.items) && playlist.items.length > 0 ? (
                    playlist.items.map((item) => (
                        <li key={item.id}>
                            {(item.song?.title || item.title || "Untitled")}{' '}
                            -{' '}
                            {(item.song?.artist || item.artist || "Unknown artist")}
                        </li>
                        ))
                    ) : (
                        playlist.tracks?.items?.map((item, idx) => (
                        <li key={item.track?.id || idx}>
                            {item.track?.name} -{" "}
                            {item.track?.artists?.map((a) => a.name).join(", ")}
                        </li>
                        ))
                    )}
                </ul>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button
                    className="btn"
                    style={{
                        padding: "0.5rem 1rem",
                        background: "#5A2FCF",
                        color: "#fff",
                        borderRadius: "8px"
                    }}
                    onClick={() => openShareModal(playlist.id)}
                // onClick={generateShareLink}
                >
                    Share
                </button>
            </div>
        </div >
    ))
}

{/* Share modal (password input -> submit -> show link) */ }
{
    showShareModal && (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.45)",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: "min(420px, 95%)",
                    background: "#fff",
                    padding: "1rem",
                    borderRadius: "10px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
                }}
            >
                {shareStage === "input" ? (
                    <>
                        <h3 style={{ marginTop: 0 }}>Create Share Link</h3>
                        <p style={{ marginTop: 0, color: "#444" }}>
                            Set a password for this playlist. Anyone with the link and this password can access it.
                        </p>

                        <input
                            ref={shareInputRef}
                            value={sharePassword}
                            type="password"
                            placeholder="Enter a password"
                            onChange={(e) => setSharePassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.6rem",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                marginTop: "0.5rem",
                                fontSize: "0.95rem",
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitSharePassword();
                            }}
                        />

                        {shareError && <div style={{ color: "red", marginTop: "0.5rem" }}>{shareError}</div>}

                        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                                onClick={submitSharePassword}
                                disabled={shareLoading}
                                className="btn"
                                style={{ background: "#5A2FCF", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px" }}
                            >
                                {shareLoading ? "Creating…" : "Create Link"}
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="btn"
                                style={{ background: "#e5e7eb", color: "#111", padding: "0.5rem 1rem", borderRadius: "8px" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={{ marginTop: 0 }}>Share Link</h3>
                        <p style={{ marginTop: 0, color: "#444" }}>Copy the link below to share this playlist.</p>

                        <input
                            ref={shareInputRef}
                            value={shareUrl}
                            readOnly
                            style={{
                                width: "100%",
                                padding: "0.6rem",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                marginTop: "0.5rem",
                                fontSize: "0.95rem",
                            }}
                            onFocus={(e) => e.target.select()}
                        />

                        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                                onClick={handleCopyClick}
                                disabled={copying}
                                className="btn"
                                style={{ background: "#5A2FCF", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px" }}
                            >
                                {copying ? "Copying…" : "Copy"}
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="btn"
                                style={{ background: "#e5e7eb", color: "#111", padding: "0.5rem 1rem", borderRadius: "8px" }}
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )}
    </>
    );
};

export default MyPlaylists;


// import React, { useEffect, useState } from 'react';
// import { getAccessToken, login } from '../services/spotifyAuth';
// import SpotifyPlayer from '../components/SpotifyPlayer';
// import '../pages/LoginPage.css';

// // Remove top-level userId, get it inside useEffect

// const MyPlaylists = () => {
//     const [playlists, setPlaylists] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [selectedPlaylist, setSelectedPlaylist] = useState(null);
//     const token = getAccessToken();

//     useEffect(() => {
//         const userId = localStorage.getItem('user_id');
//         console.log('[MyPlaylists] user_id from localStorage:', userId);
//         if (!userId || userId === 'undefined') {
//             setError('No user ID found. Please log in again.');
//             setPlaylists([]);
//             return;
//         }
//         fetchPlaylists(userId);
//     }, []);

//     async function fetchPlaylists(userId) {
//         setLoading(true);
//         try {
//             const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;
//             const jwtToken = localStorage.getItem('jwt_token');
//             const authHeaders = jwtToken
//                 ? { 'Authorization': `Bearer ${jwtToken}` }
//                 : {};
//             const resp = await fetch(`${apiBaseUrl}/api/playlists/`,{method: 'GET', headers: { ...authHeaders }});
//             if (!resp.ok) {
//                 throw new Error(`Failed to fetch playlists: ${resp.statusText}`);
//             }
//             const data = await resp.json();
//             setPlaylists(data || []);
//             setError("");
//         } catch (err) {
//             console.error(err);
//             setError("Failed to load playlists. Try again.");
//             setPlaylists([]);
//         } finally {
//             setLoading(false);
//         }
//     }

//     // Expose refresh function globally for PlaylistCreator
//     window.onPlaylistCreated = fetchPlaylists;
//     // Real Spotify search state for the card
//     const [searchTerm, setSearchTerm] = useState("");
//     const [searchResults, setSearchResults] = useState([]);
//     const [showDropdown, setShowDropdown] = useState(false);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [searchStatus, setSearchStatus] = useState("");

//     async function handleSearch(e) {
//         const value = e.target.value;
//         setSearchTerm(value);

//         if (!token) {
//             setSearchStatus("Please log in with Spotify first.");
//             setShowDropdown(false);
//             return;
//         }

//         if (value.trim().length < 2) {
//             setSearchResults([]);
//             setShowDropdown(false);
//             return;
//         }

//         try {
//             const resp = await fetch(
//                 `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=10`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             if (!resp.ok) {
//                 const text = await resp.text();
//                 throw new Error(`Search failed: ${text}`);
//             }
//             const data = await resp.json();
//             const tracks = data.tracks?.items || [];
//             const results = tracks.map((track) => ({
//                 title: track.name,
//                 artist: track.artists.map((a) => a.name).join(", "),
//                 id: track.id,
//                 uri: track.uri,
//                 album: track.album?.name,
//                 image: track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || ""
//             }));
//             setSearchResults(results);
//             setShowDropdown(true);
//             setSearchStatus("");
//         } catch (err) {
//             setSearchStatus("Error searching Spotify tracks.");
//             setSearchResults([]);
//             setShowDropdown(false);
//         }
//     }

//     function handleSelectSong(song) {
//         setSelectedSong(song);
//         setSearchTerm(`${song.title} by ${song.artist}`);
//         setSearchResults([]);
//         setShowDropdown(false);
//     }

//     async function handleSharePlaylist(playlistId) {
//         try {
//             const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;

//             const resp = await fetch(`${apiBaseUrl}/api/playlists/share/${playlistId}/`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             });

//             if (!resp.ok) {
//                 throw new Error("Failed to generate share link");
//             }

//             const data = await resp.json();

//             const shareUrl = `${window.location.origin}/share/${data.token}`;

//             await navigator.clipboard.writeText(shareUrl);

//             alert(`✅ Share link copied to clipboard!\n\n${shareUrl}`);
//         } catch (err) {
//             console.error("Share error:", err);
//             alert("❌ Failed to generate share link.");
//         }
//     }


//     // Helper: Save playlist to Spotify and open it
//     // ...existing code...
//     {/* Render all playlists */ }
//     {/* Show message if no playlists and not loading/error */ }
//     {
//         !loading && !error && playlists.length === 0 && (
//             <p>No playlists found. Try creating one!</p>
//         )
//     }
//     {
//         playlists.map((playlist) => (
//             <div key={playlist.id} style={{
//                 border: "2px solid #5A2FCF",
//                 borderRadius: "1rem",
//                 background: "#fff",
//                 boxShadow: "0 4px 16px rgba(90,47,207,0.08)",
//                 padding: "2rem",
//                 marginBottom: "2rem",
//                 maxWidth: "420px",
//                 margin: "0 auto 2rem auto"
//             }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
//                     <img src={playlist.images?.[0]?.url || "/src/assets/VibeLab.png"} alt="Playlist" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
//                     <div>
//                         <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#5A2FCF" }}>{playlist.name}</h3>
//                         <p style={{ margin: 0, color: "#888" }}>Vibe: {playlist.vibe || 'Unknown'}</p>
//                     </div>
//                 </div>
//                 <p style={{ marginTop: "1rem", color: "#333" }}><strong>Description:</strong> {playlist.description || 'No description.'}</p>
//                 <div style={{ marginTop: "1rem" }}>
//                     <strong>Songs:</strong>
//                     <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
//                         {playlist.tracks?.items?.map((item, idx) => (
//                             <li key={item.track?.id || idx}>
//                                 {item.track?.name} - {item.track?.artists?.map(a => a.name).join(', ')}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//                 {/* Save to Spotify button, only for owner */}
//                 {/* Only show button if playlist.owner?.id matches localStorage user_id */}
//                 {playlist.owner?.id === localStorage.getItem('user_id') && (
//                     <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
//                         <button
//                             className="btn btn-orange"
//                             style={{ padding: "0.5rem 1rem" }}
//                             onClick={() => handleSaveToSpotify(playlist)}
//                         >
//                             Save to Spotify
//                         </button>

//                         <button
//                             className="btn"
//                             style={{
//                                 padding: "0.5rem 1rem",
//                                 background: "#5A2FCF",
//                                 color: "#fff",
//                                 borderRadius: "8px"
//                             }}
//                             onClick={() => handleSharePlaylist(playlist.id)}
//                         >
//                             Share
//                         </button>
//                     </div>
//                 )}
//             </div>
//         ))
//     }

// };

// export default MyPlaylists;
