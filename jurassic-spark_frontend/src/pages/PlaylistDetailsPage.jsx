import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSpotifyClientCredentialAccessToken } from "../services/spotifyAuth";
import "./SharePage.css";




export default function PlaylistDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    name: "",
    description: "",
    vibe: "",
    is_open: true,
  });
  const [saving, setSaving] = useState(false);



  // Add-song state
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Song search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);

  //----------------------------------------------------------------
  // Load playlist using owner-only endpoint
  //----------------------------------------------------------------
  useEffect(() => {
    async function loadPlaylist() {
      setLoading(true);
      setError(null);

      try {
        const jwtToken = localStorage.getItem("jwt_token");
        if (!jwtToken) {
          throw new Error("You must be logged in to view this playlist.");
        }

        const resp = await fetch(`${apiBaseUrl}/api/playlists/${id}/`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(errorText || "Failed to load playlist.");
        }

        const data = await resp.json();
        setPlaylist(data);


        // init edit fields
        setEditFields({
          name: data.name,
          description: data.description,
          vibe: data.vibe,
          is_open: data.is_open,
        });

      } catch (err) {
        console.error("Error loading playlist:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [id, apiBaseUrl]);



  //----------------------------------------------------------------
  // Handle edit field changes
  //----------------------------------------------------------------
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setEditFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }



  // Save Playlist Updates (PUT)
  //----------------------------------------------------------------
  async function handleSaveEdit() {
    setSaving(true);
    setError("");

    try {
      const jwtToken = localStorage.getItem("jwt_token");

      const resp = await fetch(`${apiBaseUrl}/api/playlists/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(editFields),
      });

      if (!resp.ok) throw new Error(await resp.text());

      const updated = await resp.json();

      setPlaylist(updated);
      setEditMode(false);

    } catch (err) {
      setError("Failed to update playlist: " + err.message);
    } finally {
      setSaving(false);
    }
  }


  //----------------------------------------------------------------
  // Delete Song
  //----------------------------------------------------------------
  async function deleteSong(itemId) {
    const jwtToken = localStorage.getItem("jwt_token");
    if (!jwtToken) return;

    try {
      const resp = await fetch(
        `${apiBaseUrl}/api/playlists/playlist-items/${itemId}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      if (!resp.ok) throw new Error(await resp.text());

      // Remove from UI
      setPlaylist((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));

    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  }



  //----------------------------------------------------------------
  // Spotify search
  //----------------------------------------------------------------
  async function handleSearchChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSong(null);
    setAddError("");
    setAddSuccess("");

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const token = await getSpotifyClientCredentialAccessToken();

      const resp = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!resp.ok) throw new Error("Spotify search failed.");

      const data = await resp.json();
      const tracks = data.tracks?.items || [];

      setSearchResults(
        tracks.map((track) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          album: track.album?.name || "",
          image: track.album?.images?.[0]?.url || "",
        }))
      );
      setShowDropdown(true);

    } catch (err) {
      console.error(err);
      setSearchStatus("Error searching Spotify.");
      setSearchResults([]);
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

  //----------------------------------------------------------------
  // Add song (owner only)
  //----------------------------------------------------------------
  async function handleAddSong(e) {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!selectedSong) {
      setAddError("Select a song first.");
      return;
    }

    const jwtToken = localStorage.getItem("jwt_token");
    if (!jwtToken) {
      setAddError("You must be logged in.");
      return;
    }

    setAdding(true);
    try {
      const resp = await fetch(`${apiBaseUrl}/api/playlists/playlist-items/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          playlist_id: playlist.id,
          spotify_id: selectedSong.id,
          title: selectedSong.title,
          artist: selectedSong.artist,
          album: selectedSong.album || "Unknown",
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to add song.");
      }

      const data = await resp.json();

      // Append new item to playlist
      setPlaylist((prev) => ({
        ...prev,
        items: [...prev.items, data],
      }));

      setAddSuccess("Song added!");
      setSelectedSong(null);
      setSearchTerm("");
      setShowDropdown(false);

    } catch (err) {
      console.error("Add song error:", err);
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }



  function confirmDeletePlaylist() {
    const ok = window.confirm("Are you sure you want to delete this playlist? This cannot be undone.");
    if (ok) deletePlaylist();
  }

  async function deletePlaylist() {
    const jwtToken = localStorage.getItem("jwt_token");

    try {
      const resp = await fetch(`${apiBaseUrl}/api/playlists/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to delete playlist.");
      }

      // Redirect to homepage after deletion
      navigate("/");

    } catch (err) {
      console.error("Error deleting playlist:", err);
      alert("Failed to delete playlist: " + err.message);
    }
  }



  //----------------------------------------------------------------
  // Rendering
  //----------------------------------------------------------------
  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!playlist) return null;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h1>{playlist.name}</h1>



      <p style={{ marginTop: 0, color: "#666" }}>
        Created by: {playlist.owner?.username || "Unknown"}
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <strong>Description:</strong>
        <p>{playlist.description || "No description."}</p>
      </div>





      {/* SONG LIST */}
      <div className="share-songs-section" style={{ marginTop: "1rem" }}>
        <h3>Songs</h3>
        {playlist.items?.length ? (
          <ol className="share-songs-list">
            {playlist.items.map((item) => (
              <li key={item.id} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    {item.song?.title || item.title} —{" "}
                    <small style={{ color: "#666" }}>
                      {item.song?.artist || item.artist}
                    </small>
                  </div>



                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => deleteSong(item.id)}
                    style={{
                      marginLeft: "auto",
                      background: "transparent",
                      border: "none",
                      color: "red",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p>No songs yet.</p>
        )}
      </div>

      {/* ADD SONG */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Add a song</h3>
        <p style={{ marginTop: 0, color: "#666" }}>
          Provide a Spotify track ID or the title/artist. The playlist password will be sent to the server to authorize the add.
        </p>
        <form onSubmit={handleAddSong} style={{ marginTop: 12 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search song or artist…"
            style={{ width: "100%", padding: "0.6rem" }}
          />

          {showDropdown && searchResults.length > 0 && (
            <ul className="share-results-list">
              {searchResults.map((song) => (
                <li
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  style={{
                    padding: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {song.image && (
                    <img
                      src={song.image}
                      alt="album"
                      style={{ width: 32, height: 32 }}
                    />
                  )}
                  <div>
                    <div>{song.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {song.artist} {song.album ? `• ${song.album}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {selectedSong && (
            <div style={{ marginTop: 8 }}>
              Selected: <strong>{selectedSong.title}</strong> — {selectedSong.artist}
            </div>
          )}

          {addError && <div style={{ color: "red", marginTop: 8 }}>{addError}</div>}
          {addSuccess && <div style={{ color: "green", marginTop: 8 }}>{addSuccess}</div>}

          <div style={{ marginTop: 10 }}>
            <button type="submit" disabled={adding || !selectedSong} className="btn btn-primary"
              style={{ padding: "0.6rem 1rem" }}>
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

            <button
              onClick={confirmDeletePlaylist}
              className="btn btn-primary"
              style={{ marginLeft: 8, padding: "0.6rem 1rem" }}
            >
              Delete Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




