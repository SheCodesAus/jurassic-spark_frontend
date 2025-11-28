// src/services/spotifyAuth.js

// Read values from Vite env (NOT process.env)
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = (import.meta.env.VITE_SPOTIFY_SCOPES || "").split(" ");

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const TOKEN_STORE_KEY = "spotify_access_token";
const TOKEN_EXPIRY_KEY = "spotify_access_token_expiry";

// Temporarily add:
console.table({
    CLIENT_ID,
    REDIRECT_URI,
    SCOPES: SCOPES.join(" "),
});

/** Start the authorization code flow (no PKCE for simplicity in dev) */
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

/** Exchange code for token (via backend for security, or direct for dev) */
export async function handleCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    console.log("Callback URL:", window.location.href);
    console.log("Authorization code:", code);

    if (!code) {
        throw new Error("No authorization code found in URL.");
    }

    // For development: exchange code directly from frontend
    // NOTE: In production, use a backend to keep CLIENT_SECRET safe
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
        console.error("Token exchange error:", err);
        throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await resp.json();
    const { access_token, expires_in } = data;

    const expiryTs = Date.now() + (expires_in - 30) * 1000; // buffer 30s
    localStorage.setItem(TOKEN_STORE_KEY, access_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTs));

    // Clean URL (remove ?code=…)
    window.history.replaceState({}, document.title, REDIRECT_URI);
}

/** Get a valid token (returns null if missing/expired) */
export function getAccessToken() {
    const token = localStorage.getItem(TOKEN_STORE_KEY);
    const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0);
    if (!token || !expiry || Date.now() > expiry) return null;
    return token;
}

/** Optional: clear stored token */
export function logout() {
    localStorage.removeItem(TOKEN_STORE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
}
