import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VibeLabMobileLogo from "../assets/VibeLab_mobile.png";
import "./UserPage.css";

const API_URL = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchData() {
      try {
        // Fetch user profile
        const userRes = await fetch(`${API_URL}/api/users/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.status === 403) {
          navigate("/login");
          return;
        }
        const userData = await userRes.json();

        // Fetch playlists
        const playlistsRes = await fetch(`${API_URL}/api/playlists/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const playlistsData = await playlistsRes.json();

        setUser(userData);
        setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
      } catch (err) {
        setUser({ username: "Alice" });
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="userpage-container">
      <header className="userpage-header">
        <div className="userpage-greeting">
          Hi, <span className="userpage-username">{user?.username}</span>
        </div>
        <img src={VibeLabMobileLogo} alt="VibeLab Logo" className="userpage-logo" />
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