import React from 'react';


import PlayListCreator from '../components/PlayListCreator';
import './LoginPage.css'; // Reuse login page styles

const CreatePlaylistPage = () => {
    return (
        <div className="login-page">
            <main className="login-main">
                <div className="login-container">
                    <h2 className="login-header logo-text">Create a Playlist</h2>
                    <PlayListCreator />
                </div>
            </main>
            <footer className="login-footer">
                <div className="container text-center">
                    <p>&copy; 2025 VibeLab. Building connections through music.</p>
                </div>
            </footer>
        </div>
    );
};

export default CreatePlaylistPage;