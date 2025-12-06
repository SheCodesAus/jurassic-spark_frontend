
// import React from "react";
// import { Link } from "react-router-dom";
// import vibelabLogo from "../assets/VibeLab.png";
// import "./CreatePlaylistForm.css";
// import { getAccessToken } from "../services/spotifyAuth";

// const vibes = ["Country", "Latin", "Pop", "R&B", "Rock", "Techno"];

// const CreatePlaylistForm = () => {
//   const [playlistName, setPlaylistName] = React.useState("");
//   const [playlistDesc, setPlaylistDesc] = React.useState("");
//   const [vibe, setVibe] = React.useState("");
//   const [selectedSong, setSelectedSong] = React.useState(null);
//   const [submitted, setSubmitted] = React.useState(false);

//   // Search state
//   const [searchTerm, setSearchTerm] = React.useState("");
//   const [searchResults, setSearchResults] = React.useState([]);
//   const [showDropdown, setShowDropdown] = React.useState(false);
//   const [status, setStatus] = React.useState("");

//   const token = getAccessToken();

//   // Real Spotify search function
//   const handleSearch = async (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);

//     if (!token) {
//       setStatus("Please log in with Spotify first.");
//       setShowDropdown(false);
//       return;
//     }

//     if (value.trim().length < 2) {
//       setSearchResults([]);
//       setShowDropdown(false);
//       return;
//     }

//     try {
//       const resp = await fetch(
//         `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=10`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (!resp.ok) {
//         const text = await resp.text();
//         throw new Error(`Search failed: ${text}`);
//       }
//       const data = await resp.json();
//       const tracks = data.tracks?.items || [];
//       const results = tracks.map((track) => ({
//         title: track.name,
//         artist: track.artists.map((a) => a.name).join(", "),
//         id: track.id,
//         uri: track.uri,
//         album: track.album?.name,
//         image: track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || ""
//       }));
//       setSearchResults(results);
//       setShowDropdown(true);
//     } catch (err) {
//       setStatus("Error searching Spotify tracks.");
//       setSearchResults([]);
//       setShowDropdown(false);
//     }
//   };

//   // Select a song from dropdown
//   const handleSelectSong = (song) => {
//     setSelectedSong(song);
//     setSearchTerm(`${song.title} by ${song.artist}`);
//     setSearchResults([]);
//     setShowDropdown(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Reset previous status
//     setStatus("");

//     // Log for debugging
//     console.log("Submit clicked", { playlistName, vibe, selectedSong, token });

//     if (!token) {
//       setStatus("❌ You must be logged in with Spotify.");
//       console.warn("No Spotify token available");
//       return;
//     }

//     if (!playlistName.trim() || !vibe.trim() || !selectedSong) {
//       setStatus("❌ Please complete all fields.");
//       return;
//     }

//     try {
//       setStatus("⏳ Creating playlist...");

//       // 1️⃣ Fetch current Spotify user profile
//       console.log("Fetching Spotify user profile...");
//       const userRes = await fetch("https://api.spotify.com/v1/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!userRes.ok) {
//         const text = await userRes.text();
//         throw new Error(`Failed to fetch user profile: ${text}`);
//       }

//       const userData = await userRes.json();
//       const userId = userData.id;
//       console.log("Spotify user ID:", userId);

//       // 2️⃣ Create new playlist
//       console.log("Creating playlist...");
//       const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: playlistName,
//           description: playlistDesc || `Vibe: ${vibe}`,
//           public: true,
//         }),
//       });

//       if (!createRes.ok) {
//         const text = await createRes.text();
//         throw new Error(`Failed to create playlist: ${text}`);
//       }

//       const playlistData = await createRes.json();
//       const playlistId = playlistData.id;
//       console.log("Playlist created:", playlistData);

//       // 3️⃣ Add selected song to playlist
//       console.log("Adding track to playlist...");
//       const addTrackRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ uris: [selectedSong.uri] }),
//       });

//       if (!addTrackRes.ok) {
//         const text = await addTrackRes.text();
//         throw new Error(`Failed to add track: ${text}`);
//       }

//       console.log("Track added successfully!");
//       setStatus("✅ Playlist created successfully!");
//       setSubmitted(true);

//     } catch (err) {
//       console.error("Error creating playlist:", err);
//       setStatus(`❌ Failed to create playlist: ${err.message}`);
//     }
//   };



//   const handleClear = () => {
//     setPlaylistName("");
//     setPlaylistDesc("");
//     setVibe("");
//     setSelectedSong(null);
//     setSearchTerm("");
//     setSearchResults([]);
//     setShowDropdown(false);
//     setSubmitted(false);
//   };

//   return (
//     <div className="card login-card">
//       <div className="logo-container">
//         <img src={vibelabLogo} alt="VibeLab Logo" className="form-logo" />
//         <h2 className="text-center mb-2">Create a Playlist</h2>
//       </div>
//       <form onSubmit={handleSubmit} className="login-form">
//         <div className="form-group">
//           <label htmlFor="playlistName">Playlist Name</label>
//           <input
//             type="text"
//             id="playlistName"
//             value={playlistName}
//             onChange={(e) => setPlaylistName(e.target.value)}
//             placeholder="Enter playlist name..."
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="playlistDesc">Playlist Description</label>
//           <textarea
//             id="playlistDesc"
//             value={playlistDesc}
//             onChange={(e) => setPlaylistDesc(e.target.value)}
//             placeholder="Enter playlist description..."
//             rows={2}
//           />
//         </div>
//         <div className="form-group select-vibe-group">
//           <label htmlFor="vibe">Select the Vibe</label>
//           <select
//             id="vibe"
//             value={vibe}
//             onChange={(e) => setVibe(e.target.value)}
//             required
//           >
//             <option value="">Select Vibe</option>
//             {vibes.map((v) => (
//               <option key={v} value={v}>{v}</option>
//             ))}
//           </select>
//           <span className="custom-arrow"></span>
//         </div>
//         {/* Search bar for song */}
//         <div className="form-group search-bar-group">
//           <label htmlFor="searchSong">Search for a Song</label>
//           <input
//             type="text"
//             id="searchSong"
//             value={searchTerm}
//             onChange={handleSearch}
//             placeholder="Type song or artist..."
//             autoComplete="off"
//           />
//           {/* Dropdown results */}
//           {showDropdown && searchResults.length > 0 && (
//             <ul className="search-dropdown">
//               {searchResults.map((song, idx) => (
//                 <li
//                   key={song.id || idx}
//                   onClick={() => handleSelectSong(song)}
//                   className="search-dropdown-item"
//                 >
//                   {song.image && (
//                     <img src={song.image} alt="album cover" style={{ width: "32px", height: "32px", borderRadius: "4px", marginRight: "0.5rem" }} />
//                   )}
//                   <span className="song-title">{song.title}</span>
//                   <span className="song-artist">by {song.artist}</span>
//                   {song.album && (
//                     <span className="song-album"> ({song.album})</span>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           )}
//           {status && <div className="search-status" style={{ color: "#c00", marginTop: "0.5rem" }}>{status}</div>}
//         </div>
//         <div className="button-group">
//           <button
//             type="submit"
//             className="btn btn-orange login-btn mb-3"
//             disabled={
//               !playlistName.trim() ||
//               !vibe.trim() ||
//               !selectedSong
//             }
//           >
//             All Done!
//           </button>
//         </div>

//         {status && (
//           <div style={{ marginTop: "1rem", color: "#c00", fontWeight: "bold" }}>
//             {status}
//           </div>
//         )}

//       </form>
//       <Link to="/" className="back-home-link">Back to the Home</Link>
//       {submitted && (
//         <div className="playlist-summary" style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "0.5rem" }}>
//           <h2>Playlist Summary</h2>
//           <p><strong>Name:</strong> {playlistName}</p>
//           <p><strong>Description:</strong> {playlistDesc}</p>
//           <p><strong>Vibe:</strong> {vibe}</p>
//           <p>
//             <strong>Song:</strong>{" "}
//             {selectedSong
//               ? `${selectedSong.title} by ${selectedSong.artist}`
//               : "None"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreatePlaylistForm;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import vibelabLogo from "../assets/VibeLab.png";
import "./CreatePlaylistForm.css";
import { getAccessToken } from "../services/spotifyAuth";

const vibes = ["Country", "Latin", "Pop", "R&B", "Rock", "Techno"];

const CreatePlaylistForm = () => {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [vibe, setVibe] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [status, setStatus] = useState("");

  const [token, setToken] = useState(null);

  // Get the token when component mounts
  useEffect(() => {
    const t = getAccessToken();
    if (t) {
      setToken(t);
    } else {
      setStatus("Please log in with Spotify first.");
    }
  }, []);

  // Search tracks
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!token) {
      setStatus("Please log in with Spotify first.");
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
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          value
        )}&type=track&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resp.ok) throw new Error("Search failed");
      const data = await resp.json();
      const tracks = data.tracks?.items || [];
      const results = tracks.map((track) => ({
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        id: track.id,
        uri: track.uri,
        album: track.album?.name,
        image:
          track.album?.images?.[2]?.url ||
          track.album?.images?.[0]?.url ||
          "",
      }));
      setSearchResults(results);
      setShowDropdown(true);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error searching Spotify tracks.");
      setShowDropdown(false);
    }
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setSearchTerm(`${song.title} by ${song.artist}`);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatus("You must be logged in with Spotify.");
      return;
    }

    if (!playlistName || !vibe || !selectedSong) {
      setStatus("Please complete all fields.");
      return;
    }

    try {
      setStatus("Creating playlist...");

      // Get Spotify user ID
      const userRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error("Failed to fetch user profile");
      const userData = await userRes.json();
      const userId = userData.id;

      // Create playlist
      const createRes = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistName,
            description: playlistDesc || `Vibe: ${vibe}`,
            public: true,
          }),
        }
      );
      if (!createRes.ok) throw new Error("Failed to create playlist");
      const playlistData = await createRes.json();

      // Add track to playlist
      const addTrackRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [selectedSong.uri] }),
        }
      );
      if (!addTrackRes.ok) throw new Error("Failed to add track");

      setStatus("✅ Playlist created successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to create playlist.");
    }
  };

  const handleClear = () => {
    setPlaylistName("");
    setPlaylistDesc("");
    setVibe("");
    setSelectedSong(null);
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setSubmitted(false);
    setStatus("");
  };

  if (!token) {
    return (
      <div className="card login-card">
        <h2>Please log in with Spotify to create a playlist</h2>
        <a href="/login" className="btn btn-orange">
          Log in with Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="card login-card">
      <div className="logo-container">
        <img src={vibelabLogo} alt="VibeLab Logo" className="form-logo" />
        <h2 className="text-center mb-2">Create a Playlist</h2>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        {/* Playlist Name */}
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

        {/* Playlist Description */}
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

        {/* Vibe */}
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

        {/* Song Search */}
        <div className="form-group search-bar-group">
          <label htmlFor="searchSong">Search for a Song</label>
          <input
            type="text"
            id="searchSong"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Type song or artist..."
            autoComplete="off"
          />
          {showDropdown && searchResults.length > 0 && (
            <ul className="search-dropdown">
              {searchResults.map((song, idx) => (
                <li
                  key={song.id || idx}
                  onClick={() => handleSelectSong(song)}
                  className="search-dropdown-item"
                >
                  {song.image && (
                    <img
                      src={song.image}
                      alt="album cover"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        marginRight: "0.5rem",
                      }}
                    />
                  )}
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">by {song.artist}</span>
                  {song.album && <span className="song-album"> ({song.album})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Button */}
        <div className="button-group">
          <button
            type="submit"
            className="btn btn-orange login-btn mb-3"
            disabled={!playlistName || !vibe || !selectedSong}
          >
            All Done!
          </button>
          <button type="button" className="btn btn-gray" onClick={handleClear}>
            Clear
          </button>
        </div>

        {status && (
          <div style={{ marginTop: "1rem", color: "#c00", fontWeight: "bold" }}>
            {status}
          </div>
        )}
      </form>

      <Link to="/" className="back-home-link">
        Back to the Home
      </Link>

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
            <strong>Description:</strong> {playlistDesc}
          </p>
          <p>
            <strong>Vibe:</strong> {vibe}
          </p>
          <p>
            <strong>Song:</strong>{" "}
            {selectedSong ? `${selectedSong.title} by ${selectedSong.artist}` : "None"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreatePlaylistForm;
