// src/services/spotifyAuth.js

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = (import.meta.env.VITE_SPOTIFY_SCOPES || "").split(" ");

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

// LocalStorage keys
const TOKEN_STORE_KEY = "spotify_access_token";
const TOKEN_EXPIRY_KEY = "spotify_access_token_expiry";
const JWT_STORE_KEY = "access_token"; // JWT from backend

console.table({
    CLIENT_ID,
    REDIRECT_URI,
    SCOPES: SCOPES.join(" "),
});

/** Start Spotify authorization */
export async function login() {
    if (!CLIENT_ID || !REDIRECT_URI) {
        console.error("Missing CLIENT_ID or REDIRECT_URI in env.");
        return;
    }

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(" "),
    });

    const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    window.location.assign(authUrl);
}

/** Handle Spotify callback, exchange code for token and get JWT from backend */
export async function handleCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) throw new Error("No authorization code found in URL.");

    // Exchange code with Spotify for access token
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
    });

    const resp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    if (!resp.ok) {
        const err = await resp.text();
        console.error("Spotify token exchange error:", err);
        throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await resp.json();
    const { access_token, expires_in } = data;
    const expiryTs = Date.now() + (expires_in - 30) * 1000; // buffer 30s

    // Save Spotify token in localStorage
    localStorage.setItem(TOKEN_STORE_KEY, access_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTs));

    // --- NEW: Send Spotify token to backend to get JWT ---
    try {
        const backendResp = await fetch("http://localhost:8000/api/token/spotify/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token }),
        });

        if (!backendResp.ok) {
            const errText = await backendResp.text();
            console.error("Backend JWT exchange error:", errText);
            throw new Error("Failed to get JWT from backend");
        }

        const jwtData = await backendResp.json();
        localStorage.setItem(JWT_STORE_KEY, jwtData.access); // store JWT for API calls
    } catch (err) {
        console.error(err);
    }

    // Clean URL
    window.history.replaceState({}, document.title, REDIRECT_URI);
}

/** Get valid Spotify token */
export function getAccessToken() {
    const token = localStorage.getItem(TOKEN_STORE_KEY);
    const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0);
    if (!token || !expiry || Date.now() > expiry) return null;
    return token;
}

/** Get backend JWT */
export function getJWT() {
    return localStorage.getItem(JWT_STORE_KEY);
}

/** Logout */
export function logout() {
    localStorage.removeItem(TOKEN_STORE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(JWT_STORE_KEY);
}
