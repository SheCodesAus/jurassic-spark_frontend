
// src/pages/Callback.jsx
import { useEffect, useState } from "react";
import { handleCallback } from "../services/spotifyAuth";

export default function Callback() {
    const [status, setStatus] = useState("Authorizing…");

    useEffect(() => {
        async function run() {
        try {
            await handleCallback();
            setStatus("Authorization successful. Redirecting…");
            window.location.assign("/spotify");
        } catch (err) {
            console.error(err);
            setStatus("Authorization failed. Please try again.");
        }
        }
        run();
    }, []);

    return (
        <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Spotify Login</h1>
        <p>{status}</p>
        </main>
    );
}
