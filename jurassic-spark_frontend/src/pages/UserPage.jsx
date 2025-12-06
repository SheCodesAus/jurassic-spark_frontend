import React, { useEffect, useState } from "react";
import UserPhoto from "../assets/listening.png";
import "./UserPage.css";

const API_URL = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("jwt_token");
  console.log("UserPage token:", token);
  if (!token) {
  // Optionally redirect to login if not authenticated
  window.location.href = "/login";
  return;
  }

  async function fetchData(token) {
    try {
      // Fetch user profile
      const userRes = await fetch(`${API_URL}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error("User not authenticated");
      const userData = await userRes.json();

      console.log('User Data:', userData);

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

  if (loading) return <div className="userpage-loading">Loading...</div>;

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
        <h2>Your Playlists</h2>
        <ul className="userpage-playlists">
          {Array.isArray(playlists) && playlists.length > 0 ? (
            playlists.map((playlist) => (
              <li key={playlist.id} className="userpage-playlist-item">
                <span className="playlist-name">{playlist.name}</span>
                <span className="playlist-vibe">{playlist.vibe}</span>
              </li>
            ))
          ) : (
            <li>No playlists found.</li>
          )}
        </ul>
      </main>
    </div>
  );
}