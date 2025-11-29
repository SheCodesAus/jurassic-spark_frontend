import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../services/spotifyAuth';

const SpotifyPlayer = ({ playlistUri }) => {
    const [player, setPlayer] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [error, setError] = useState(null);
    const token = getAccessToken();

    useEffect(() => {
        if (!token) {
            setError('No token available');
            return;
        }

        const initializePlayer = () => {
            try {
                if (!window.Spotify) {
                    console.log('Spotify SDK not loaded yet, retrying...');
                    setTimeout(initializePlayer, 1000);
                    return;
                }

                const player = new window.Spotify.Player({
                    name: 'VibeLab Player',
                    getOAuthToken: (callback) => {
                        const currentToken = getAccessToken();
                        if (currentToken) {
                            callback(currentToken);
                        } else {
                            console.error('Token expired or unavailable');
                            setError('Token expired. Please log in again.');
                        }
                    },
                    volume: 0.5,
                });

                setPlayer(player);
                setError(null);

                // Player ready
                player.addListener('player_state_changed', (state) => {
                    if (!state) return;
                    setIsPaused(state.paused);
                    setCurrentTrack(state.current_track);
                    console.log('Player state updated:', state);
                });

                // Get device ID
                player.addListener('ready', ({ device_id }) => {
                    console.log('Player ready with device ID:', device_id);
                    setDeviceId(device_id);
                    setError(null);
                });

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline:', device_id);
                    setError('Player disconnected. Please try again.');
                });

                player.addListener('authentication_error', ({ message }) => {
                    console.error('Auth error:', message);
                    setError('Authentication failed. Please log in again.');
                });

                player.addListener('account_error', ({ message }) => {
                    console.error('Account error:', message);
                    setError('Account error. Make sure you have an active Spotify account.');
                });

                player.addListener('playback_error', ({ message }) => {
                    console.error('Playback error:', message);
                    setError('Playback error: ' + message);
                });

                // Connect to the player
                player.connect().then((success) => {
                    if (success) {
                        console.log('Player connected successfully');
                    } else {
                        console.error('Failed to connect player');
                        setError('Failed to connect to Spotify player');
                    }
                });
            } catch (err) {
                console.error('Error initializing player:', err);
                setError('Failed to initialize player: ' + err.message);
            }
        };

        initializePlayer();

        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [token]);

    async function playPlaylist() {
        if (!deviceId || !token) {
            const msg = !deviceId ? 'Player not ready yet. Wait a moment...' : 'Token expired';
            console.warn(msg);
            setError(msg);
            return;
        }

        if (!playlistUri) {
            const msg = 'No playlist URI provided';
            console.warn(msg);
            setError(msg);
            return;
        }

        try {
            console.log('Attempting to play playlist:', playlistUri, 'on device:', deviceId);
            
            const response = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        context_uri: playlistUri,
                        offset: { position: 0 },
                    }),
                }
            );

            console.log('Playback response:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Playback error:', errorText);
                throw new Error(`Playback failed: ${response.status} ${response.statusText}`);
            }

            setError(null);
            console.log('Playlist started playing');
        } catch (err) {
            console.error('Error playing playlist:', err);
            setError(err.message || 'Failed to play playlist');
        }
    }

    function togglePlayPause() {
        if (player) {
            player.togglePlay();
        }
    }

    return (
        <div
            style={{
                background: '#1DB954',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                color: 'white',
                marginTop: '1.5rem',
            }}
        >
            <h3>🎵 Spotify Player</h3>

            {error && (
                <div
                    style={{
                        background: '#ff4444',
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                <p>
                    <strong>Status:</strong> {deviceId ? '✅ Connected' : '⏳ Connecting...'}
                </p>
                {deviceId && (
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        Device ID: {deviceId.substring(0, 8)}...
                    </p>
                )}
            </div>

            {currentTrack ? (
                <div style={{ marginBottom: '1rem' }}>
                    <p>
                        <strong>Now Playing:</strong> {currentTrack.name}
                    </p>
                    <p>
                        <strong>Artist:</strong>{' '}
                        {currentTrack.artists.map((a) => a.name).join(', ')}
                    </p>
                </div>
            ) : (
                <p>Click "Play Playlist" to start</p>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                }}
            >
                {playlistUri && (
                    <button
                        onClick={playPlaylist}
                        className="btn"
                        style={{
                            background: '#fff',
                            color: '#1DB954',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '2rem',
                            cursor: 'pointer',
                        }}
                    >
                        ▶️ Play Playlist
                    </button>
                )}

                <button
                    onClick={togglePlayPause}
                    className="btn"
                    style={{
                        background: '#fff',
                        color: '#1DB954',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '2rem',
                        cursor: 'pointer',
                    }}
                    disabled={!currentTrack}
                >
                    {isPaused ? '⏸️ Play' : '▶️ Pause'}
                </button>
            </div>

            <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>
                💡 Make sure Spotify is open and active on your device. Click "Play Playlist" to start playback.
            </p>
        </div>
    );
};

export default SpotifyPlayer;
