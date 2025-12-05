import React, { useEffect, useState } from "react";
import UserPhoto from "../assets/listening.png";
import "./UserPage.css";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA: No login or backend required
    setUser({ username: "TestUser", profile_photo: UserPhoto });
    setPlaylists([
      { id: 1, name: "My Summer Vibes", vibe: "Pop" },
      { id: 2, name: "Chill Beats", vibe: "Techno" },
    ]);
    setLoading(false);
  }, []);

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