// src/components/PlaylistCard.jsx
import React from "react";
import "./PlaylistCard.css";

export default function PlaylistCard({ playlist }) {
  if (!playlist) return null;

  const {
    name,
    description,
    vibe,
    is_open,
    owner,  
    tracks = [],
  } = playlist;

  return (
    <div className="playlist-card">
      <div className="playlist-card__header">
        <h2 className="playlist-card__title">{name}</h2>

        {owner && (
          <p className="playlist-card__owner">
            Created by <span>{owner}</span>
          </p>
        )}
      </div>

      {description && (
        <p className="playlist-card__description">{description}</p>
      )}

      <div className="playlist-card__meta">
        {vibe && <span className="playlist-card__pill">Vibe: {vibe}</span>}
        {typeof is_open === "boolean" && (
          <span className="playlist-card__pill">
            {is_open ? "Open playlist" : "Locked playlist"}
          </span>
        )}
      </div>

      <div className="playlist-card__tracks">
        {tracks.length === 0 ? (
          <p className="playlist-card__empty">
            No tracks in this playlist yet.
          </p>
        ) : (
          <ul>
            {tracks.map((track, index) => (
              <li
                key={track.spotify_id || `${track.name}-${index}`}
                className="playlist-card__track"
              >
                <div className="playlist-card__track-main">
                  <span className="playlist-card__track-name">
                    {index + 1}. {track.name}
                  </span>
                  <span className="playlist-card__track-artist">
                    {track.artist}
                  </span>
                  {track.album && (
                    <span className="playlist-card__track-album">
                      {track.album}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
