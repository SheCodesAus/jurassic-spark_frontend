// Frontend service to handle playlist saving/fetching
// This prepares data to send to backend when it's ready

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
