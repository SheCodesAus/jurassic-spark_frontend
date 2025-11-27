
// src/services/spotifyAuth.js

// Read values from Vite env (NOT process.env)
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = (import.meta.env.VITE_SPOTIFY_SCOPES || "").split(" ");

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const CODE_VERIFIER_KEY = "spotify_code_verifier";
const TOKEN_STORE_KEY = "spotify_access_token";
const TOKEN_EXPIRY_KEY = "spotify_access_token_expiry";

/** Base64-url encoding (no padding, URL-safe) */
function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+/g, "");
    }

    
// Temporarily add:
console.table({
    CLIENT_ID,
    REDIRECT_URI,
    SCOPES: SCOPES.join(" "),
});

    /** Generate a random string for PKCE code_verifier */
    function generateCodeVerifier(length = 128) {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
    }

    /** Create code_challenge = base64url( SHA256(code_verifier) ) */
    async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(digest);
    }

    /** Start the PKCE login flow */
    export async function login() {
    if (!CLIENT_ID || !REDIRECT_URI) {
        console.error("Missing CLIENT_ID or REDIRECT_URI in env.");
        return;
    }

    const codeVerifier = generateCodeVerifier();
    localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        scope: SCOPES.join(" "),
    });

    const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    window.location.assign(authUrl);
    }

    /** Exchange code for token (PKCE) */
    export async function handleCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);

    if (!code) {
        throw new Error("No authorization code found in URL.");
    }
    if (!codeVerifier) {
        throw new Error("Missing code_verifier in storage.");
    }

    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
    });

    const resp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await resp.json();
    const { access_token, expires_in } = data;

    const expiryTs = Date.now() + (expires_in - 30) * 1000; // buffer 30s
    localStorage.setItem(TOKEN_STORE_KEY, access_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTs));

    // Clean URL (remove ?code=…) and stay consistent with your redirect URI
    // If REDIRECT_URI is http://127.0.0.1:5173/callback, we can push to /spotify afterward in Callback.jsx
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
    localStorage.removeItem(CODE_VERIFIER_KEY);
}
