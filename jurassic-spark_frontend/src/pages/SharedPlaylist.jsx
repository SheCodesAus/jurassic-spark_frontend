import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedPlaylist() {
    const { playlistId, token } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [error, setError] = useState("");

    const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    useEffect(() => {
        async function fetchPlaylist() {
            try {
                const resp = await axios.get(
                    `${API_BASE}/share/${playlistId}/${token}/`
                );
                setPlaylist(resp.data);
            } catch (err) {
                console.error(err);
                setError("Invalid or expired share link.");
            }
        }

        fetchPlaylist();
    }, [playlistId, token]);

    if (error) return <h2 style={{ padding: "2rem" }}>{error}</h2>;
    if (!playlist) return <h2 style={{ padding: "2rem" }}>Loading playlist...</h2>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>{playlist.name}</h2>
            <p>{playlist.description}</p>

            <h3>Songs</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {playlist.items?.map((item) => (
                    <li
                        key={item.id}
                        style={{
                            padding: "0.7rem",
                            borderBottom: "1px solid #ddd",
                            marginBottom: "0.5rem"
                        }}
                    >
                        <strong>{item.song.title}</strong>
                        <br />
                        <small>{item.song.artist}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}
