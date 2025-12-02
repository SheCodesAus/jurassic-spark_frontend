import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyPlaylists() {
    const [playlists, setPlaylists] = useState([]);
    const [shareLink, setShareLink] = useState("");
    const [loadingShare, setLoadingShare] = useState(false);

    const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    // Fetch user's playlists
    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("access");
                const resp = await axios.get(`${API_BASE}/api/playlists/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPlaylists(resp.data);
            } catch (err) {
                console.error("Failed to load playlists:", err);
            }
        }
        fetchData();
    }, []);

    // Generate sharing link
    async function handleShare(playlistId) {
        setLoadingShare(true);
        setShareLink("");

        try {
            const token = localStorage.getItem("access");

            const resp = await axios.post(
                `${API_BASE}/playlists/${playlistId}/share/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShareLink(resp.data.share_url);
        } catch (err) {
            console.error("Share error:", err);
            alert("Failed to generate share link.");
        } finally {
            setLoadingShare(false);
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Your Playlists</h2>

            {playlists.length === 0 && <p>No playlists yet.</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {playlists.map((p) => (
                    <li
                        key={p.id}
                        style={{
                            padding: "1rem",
                            border: "1px solid #ddd",
