import React, { useEffect, useState } from "react";
import UserPhoto from "../assets/listening.png";
import NoPlaylistGif from "../assets/rocker.gif";
import Playlisticon from "../assets/listen.png";
import "./UserPage.css";

const API_URL = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  useEffect(() => {
    async function fetchData(token) {
      try {
        // Fetch user profile
        const userRes = await fetch(`${API_URL}/api/users/profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error("User not authenticated");
        const userData = await userRes.json();

        // Fetch playlists
        const playlistsRes = await fetch(`${API_URL}/api/playlists/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const playlistsData = await playlistsRes.json();

        setUser({
          username: userData.username,
          profile_photo: userData.profile_photo || UserPhoto
        });
        setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData(token);
  }, [token]);

  if (loading) return <div className="userpage-loading">Loading...</div>;

  // Helper to get the vibe class
  const getVibeClass = (vibe) =>
    `playlist-vibe vibe-${(vibe || '').toLowerCase().replace(/[^a-z]/g, '')}`;

  return (
    <div className="userpage-container">
      <header className="userpage-header">
        <div className="userpage-profile">
          <img
            src={user?.profile_photo || UserPhoto}
            alt="User"
            className="userpage-photo"
          />
          <div className="userpage-greeting">
            Hi, <span className="userpage-username">{user?.username}</span>
          </div>
        </div>
      </header>      

      <main className="userpage-main">
        <div className="no-playlists-container">
          <div className="userpage-title-row">
            <span className="userpage-title-icon-circle">
              <img src={Playlisticon} alt="Playlist icon" className="userpage-title-icon" />
            </span>
            <h2 className="userpage-title">Your Playlists</h2>
          </div>
          {Array.isArray(playlists) && playlists.length > 0 ? (
            <ul className="userpage-playlists">
              {playlists.map((playlist) => (
                <li key={playlist.id} className="userpage-playlist-item">
                  <span className="playlist-name">{playlist.name}</span>
                  <span className={getVibeClass(playlist.vibe)}>{playlist.vibe}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="no-playlists-message">
                No playlist found... <br />
                <span>It’s time to start designing your own!</span>
              </p>
              <div className="no-playlists-icon-circle">
                <img
                  src={NoPlaylistGif}
                  alt="Animated playlist"
                  className="no-playlists-icon"
                />
              </div>
              <a href="/spotify" className="btn btn-primary hero-btn">
                Create a Playlist
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}