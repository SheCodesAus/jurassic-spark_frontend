
// src/components/SpotifyLoginButton.jsx
import React from "react";
import { login, getAccessToken, logout } from "../services/spotifyAuth";

export default function SpotifyLoginButton() {
    const token = getAccessToken();

    return (
        <div style={{ padding: "1rem" }}>
        {token ? (
            <>
            <p>✅ Logged in to Spotify</p>
            <button onClick={logout}>Logout</button>
            </>
        ) : (
            <button onClick={login}>Login with Spotify</button>
        )}
        </div>
    );
}
