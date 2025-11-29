// Frontend service to handle playlist saving/fetching
// This prepares data to send to backend when it's ready

export async function savePlaylistToBackend(userId, playlistData) {
  try {
    // TODO: Replace with your backend URL when ready
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        spotifyPlaylistId: playlistData.id,
        name: playlistData.name,
        description: playlistData.description,
        imageUrl: playlistData.images?.[0]?.url || '',
        trackCount: playlistData.tracks?.total || 0,
        spotifyUri: playlistData.uri,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save playlist: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error saving playlist:', err);
    throw err;
  }
}

export async function getUserPlaylists(userId) {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
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
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
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
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
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
