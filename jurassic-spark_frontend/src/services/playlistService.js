// Frontend service to handle playlist saving/fetching
// This prepares data to send to backend when it's ready

const DEFAULT_BACKEND = "http://localhost:8000";
const backendUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL || DEFAULT_BACKEND;

export async function savePlaylistToBackend({ name, description, vibe, is_open = false, tracks = [], accessToken }) {
  try {
    const backendUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;
    // Get JWT token from localStorage (update key if needed)
    const jwtToken = localStorage.getItem('jwt_token');
    const authHeaders = jwtToken
      ? { 'Authorization': `Bearer ${jwtToken}` }
      : {};

    // 1. Create the playlist
    const playlistRes = await fetch(`${backendUrl}/api/playlists/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ name, description, vibe, is_open })
    });
    if (!playlistRes.ok) {
      throw new Error(`Failed to create playlist: ${playlistRes.statusText}`);
    }
    const playlist = await playlistRes.json();
    // 2. Add each track to the playlist
    for (const track of tracks) {
      const songRes = await fetch(`${backendUrl}/api/playlists/playlist-items/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          playlist_id: playlist.id,
          spotify_id: track.spotify_id || track.id,
          title: track.name,
          artist: track.artists ? track.artists.map(a => a.name).join(', ') : track.artist,
          album: track.album ? (track.album.name || track.album) : ''
        })
      });
      if (!songRes.ok) {
        // Optionally handle song add errors individually
        console.error(`Failed to add song: ${track.name}`);
      }
    }
    return playlist;
  } catch (err) {
    console.error('Error saving playlist:', err);
    throw err;
  }
}


/**
 * GET public metadata for a shared playlist token
 * GET /api/playlists/share/<token>/
 */
export async function getSharedPlaylist(token) {
  if (!token) throw new Error("Missing share token");
  const url = `${backendUrl}/api/playlists/share/${encodeURIComponent(token)}/`;
  const resp = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || resp.statusText || `Failed to fetch shared playlist (${resp.status})`);
  }
  return await resp.json();
}

/**
 * Validate a share token + accessCode and return the unlocked full playlist.
 * POST /api/playlists/share/validate/
 * Body: { share_token, accessCode }
 */
export async function validateShareAccess(token, accessCode) {
  if (!token) throw new Error("Missing share token");
  const body = { share_token: token, accessCode: accessCode ?? "" };
  const url = `${backendUrl}/api/playlists/share/validate/`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await resp.text().catch(() => "");
  if (!resp.ok) {
    try {
      const json = text ? JSON.parse(text) : null;
      const msg = (json && (json.detail || json.message)) || text || resp.statusText;
      throw new Error(msg || `Failed to validate share token (${resp.status})`);
    } catch {
      throw new Error(text || resp.statusText || `Failed to validate share token (${resp.status})`);
    }
  }
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/**
 * Add a playlist item.
 * POST /api/playlists/playlist-items/add/
 * payload: { playlist_id, spotify_id, title, artist, album, accessCode }
 *
 * Note: For shared playlists we intentionally don't require Authorization header.
 * If you want to include JWT when available, pass includeAuth: true in options.
 */
export async function addPlaylistItem(payload, options = { includeAuth: false }) {
  const url = `${backendUrl}/api/playlists/playlist-items/add/`;
  const headers = { "Content-Type": "application/json" };
  if (options.includeAuth) {
    const jwt = localStorage.getItem("jwt_token");
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await resp.text().catch(() => "");
  if (!resp.ok) {
    try {
      const json = text ? JSON.parse(text) : null;
      const msg = (json && (json.detail || json.message)) || text || resp.statusText;
      throw new Error(msg || `Failed to add playlist item (${resp.status})`);
    } catch {
      throw new Error(text || resp.statusText || `Failed to add playlist item (${resp.status})`);
    }
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function getUserPlaylists(userId) {
  try {
    const backendUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/playlists/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching playlists:', err);
    throw err;
  }
}

export async function deletePlaylistFromBackend(playlistId) {
  try {
    const backendUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete playlist: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error deleting playlist:', err);
    throw err;
  }
}

export async function updatePlaylistOnBackend(playlistId, updates) {
  try {
    const backendUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/playlists/${playlistId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update playlist: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error updating playlist:', err);
    throw err;
  }
}
