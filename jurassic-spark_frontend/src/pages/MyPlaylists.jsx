// import React, { useEffect, useState } from 'react';
// import { getAccessToken, login } from '../services/spotifyAuth';
// import SpotifyPlayer from '../components/SpotifyPlayer';
// import '../pages/LoginPage.css';

// const MyPlaylists = () => {
//     const [playlists, setPlaylists] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [selectedPlaylist, setSelectedPlaylist] = useState(null);
//     const token = getAccessToken();

//     useEffect(() => {
//         if (token) {
//             fetchPlaylists();
//         }
//     }, [token]);

//     async function fetchPlaylists() {
//         if (!token) {
//             setError("Please log in with Spotify first.");
//             return;
//         }

//         setLoading(true);
//         try {
//             const resp = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (!resp.ok) {
//                 throw new Error(`Failed to fetch playlists: ${resp.statusText}`);
//             }

//             const data = await resp.json();
//             setPlaylists(data.items || []);
//             setError("");
//         } catch (err) {
//             console.error(err);
//             setError("Failed to load playlists. Try again.");
//             setPlaylists([]);
//         } finally {
//             setLoading(false);
//         }
//     }
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

//     return (
//         <div className="login-page">
//             <main className="login-main">
//                 <div className="login-container">
//                     <h2 className="login-header logo-text">My Playlists</h2>
//                     {/* Mock playlist card for styling */}
//                     <div style={{
//                         border: "2px solid #5A2FCF",
//                         borderRadius: "1rem",
//                         background: "#fff",
//                         boxShadow: "0 4px 16px rgba(90,47,207,0.08)",
//                         padding: "2rem",
//                         marginBottom: "2rem",
//                         maxWidth: "420px",
//                         margin: "0 auto 2rem auto"
//                     }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
//                             <img src="/src/assets/VibeLab.png" alt="Vibe Logo" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
//                             <div>
//                                 <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#5A2FCF" }}>VibeLab Vibes</h3>
//                                 <p style={{ margin: 0, color: "#888" }}>Vibe: Pop</p>
//                             </div>
//                         </div>
//                         <p style={{ marginTop: "1rem", color: "#333" }}><strong>Description:</strong> My favorite pop tracks for coding!</p>
//                         <div style={{ marginTop: "1rem" }}>
//                             <strong>Songs:</strong>
//                             <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
//                                 <li>Blinding Lights - The Weeknd</li>
//                                 <li>Levitating - Dua Lipa</li>
//                                 <li>Shape of You - Ed Sheeran</li>
//                             </ul>
//                         </div>
//                         {/* Search bar and dropdown above Add Song button */}
//                         <div style={{ marginTop: "1rem", position: "relative" }}>
//                             <input
//                                 type="text"
//                                 value={searchTerm}
//                                 onChange={handleSearch}
//                                 placeholder="Search for a song..."
//                                 style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc" }}
//                             />
//                             {showDropdown && searchResults.length > 0 && (
//                                 <ul style={{
//                                     position: "absolute",
//                                     top: "2.5rem",
//                                     left: 0,
//                                     width: "100%",
//                                     background: "#fff",
//                                     border: "1px solid #ddd",
//                                     borderRadius: "0.25rem",
//                                     boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//                                     zIndex: 10,
//                                     listStyle: "none",
//                                     margin: 0,
//                                     padding: 0
//                                 }}>
//                                     {searchResults.map((song, idx) => (
//                                         <li
//                                             key={song.id || idx}
//                                             onClick={() => handleSelectSong(song)}
//                                             style={{ padding: "0.5rem 1rem", cursor: "pointer", borderBottom: "1px solid #eee", display: "flex", alignItems: "center" }}
//                                         >
//                                             {song.image && (
//                                                 <img src={song.image} alt="album cover" style={{ width: "32px", height: "32px", borderRadius: "4px", marginRight: "0.5rem" }} />
//                                             )}
//                                             <span style={{ fontWeight: 600 }}>{song.title}</span> <span style={{ color: "#888", marginLeft: "0.5rem" }}>by {song.artist}</span>
//                                             {song.album && (
//                                                 <span style={{ color: "#aaa", marginLeft: "0.5rem" }}>({song.album})</span>
//                                             )}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             )}
//                             {searchStatus && <div style={{ color: "#c00", marginTop: "0.5rem" }}>{searchStatus}</div>}
//                         </div>
//                         <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
//                             <button className="btn btn-orange" style={{ padding: "0.5rem 1rem" }}>Add Song</button>
//                         </div>
//                     </div>
//                     {/* ...existing code for playlists rendering... */}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default MyPlaylists;

import React, { useEffect, useState } from "react";
import { getAccessToken } from "../services/spotifyAuth";
import "../pages/LoginPage.css";
import axios from "axios";

// Backend URL
const API = "http://localhost:8000/api";

// Get CSRF token if needed
function getCSRFToken() {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];
}

// Get JWT token from localStorage
function getAuthHeaders() {
    const token = localStorage.getItem("access_token");
    return {
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCSRFToken(),
    };
}

const MyPlaylists = () => {
    const token = getAccessToken();

    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingBackend, setLoadingBackend] = useState(false);

    const [newTitle, setNewTitle] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [searchStatus, setSearchStatus] = useState("");

    useEffect(() => {
        fetchBackendPlaylists();
    }, []);

    // ----------------------
    // Fetch user playlists
    // ----------------------
    async function fetchBackendPlaylists() {
        setLoadingBackend(true);
        try {
            const resp = await axios.get(`${API}/playlists/`, {
                headers: getAuthHeaders(),
            });
            setUserPlaylists(resp.data);
        } catch (err) {
            console.error("Failed to fetch playlists:", err);
        } finally {
            setLoadingBackend(false);
        }
    }

    // ----------------------
    // Create playlist
    // ----------------------
    async function handleCreatePlaylist() {
        if (!newTitle) return alert("Playlist needs a title");

        try {
            const resp = await axios.post(
                `${API}/playlists/`,
                { title: newTitle, accessCode: newPassword },
                { headers: getAuthHeaders() }
            );

            alert("Playlist created!");
            setNewTitle("");
            setNewPassword("");
            fetchBackendPlaylists();
        } catch (err) {
            console.error("Failed to create playlist:", err);
            alert("Failed to create playlist");
        }
    }

    // ----------------------
    // Add song to playlist
    // ----------------------
    async function addSongToPlaylist() {
        if (!selectedPlaylistId) return alert("Select a playlist");
        if (!selectedSong) return alert("Select a song");

        try {
            await axios.post(
                `${API}/playlists/add-item/`,
                {
                    playlist_id: selectedPlaylistId,
                    spotify_id: selectedSong.id,
                    title: selectedSong.title,
                    artist: selectedSong.artist,
                    album: selectedSong.album,
                },
                { headers: getAuthHeaders() }
            );

            alert("Song added!");
        } catch (err) {
            console.error("Failed to add song:", err);
            alert("Failed to add song");
        }
    }

    // ----------------------
    // Generate share link
    // ----------------------
    async function generateShareLink(id) {
        try {
            const resp = await axios.post(
                `${API}/playlists/${id}/generate-share-link/`,
                {},
                { headers: getAuthHeaders() }
            );

            alert("Share link: " + resp.data.share_url);
        } catch (err) {
            console.error("Could not generate share link:", err);
            alert("Could not generate share link");
        }
    }

    // ----------------------
    // Spotify search
    // ----------------------
    async function handleSearch(e) {
        const value = e.target.value;
        setSearchTerm(value);

        if (!token) {
            setSearchStatus("Please log in with Spotify first.");
            return;
        }

        if (value.trim().length < 2) {
            setShowDropdown(false);
            return;
        }

        try {
            const resp = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                    value
                )}&type=track&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await resp.json();
            const tracks = data.tracks?.items || [];

            setSearchResults(
                tracks.map((t) => ({
                    id: t.id,
                    title: t.name,
                    artist: t.artists.map((a) => a.name).join(", "),
                    album: t.album?.name,
                    image: t.album.images[2]?.url,
                }))
            );
            setShowDropdown(true);
        } catch (err) {
            console.error(err);
            setSearchStatus("Error searching Spotify");
        }
    }

    function handleSelectSong(song) {
        setSelectedSong(song);
        setSearchTerm(`${song.title} – ${song.artist}`);
        setShowDropdown(false);
    }

    // ----------------------
    // Render
    // ----------------------
    return (
        <div className="login-page">
            <main className="login-main">
                <div className="login-container">
                    <h2 className="login-header logo-text">My VibeLab Playlists</h2>

                    {/* CREATE PLAYLIST */}
                    <div style={{ marginBottom: "2rem" }}>
                        <h3>Create Playlist</h3>
                        <input
                            placeholder="Playlist title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <input
                            placeholder="Password (optional)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={handleCreatePlaylist}>Create</button>
                    </div>

                    {/* USER PLAYLISTS */}
                    <h3>Your Playlists</h3>
                    {loadingBackend ? (
                        <p>Loading...</p>
                    ) : userPlaylists.length === 0 ? (
                        <p>No playlists yet</p>
                    ) : (
                        userPlaylists.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    border: "2px solid #5A2FCF",
                                    padding: "1rem",
                                    marginBottom: "1rem",
                                    borderRadius: "8px",
                                }}
                            >
                                <h4>{p.title}</h4>
                                <button onClick={() => setSelectedPlaylistId(p.id)}>
                                    Select for adding songs
                                </button>
                                <button onClick={() => generateShareLink(p.id)}>Share</button>
                            </div>
                        ))
                    )}

                    {/* SEARCH & ADD SONG */}
                    <div style={{ marginTop: "3rem" }}>
                        <h3>Add Song to Playlist</h3>
                        <p>
                            Selected playlist:{" "}
                            {selectedPlaylistId ? selectedPlaylistId : "None"}
                        </p>
                        <input
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search Spotify"
                        />
                        {showDropdown &&
                            searchResults.map((s) => (
                                <div
                                    key={s.id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSelectSong(s)}
                                >
                                    {s.title} — {s.artist}
                                </div>
                            ))}
                        <button onClick={addSongToPlaylist} style={{ marginTop: "1rem" }}>
                            Add to Playlist
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyPlaylists;
