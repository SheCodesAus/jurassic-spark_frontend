import React from 'react';
import CreatePlaylistForm from '../components/CreatePlaylistForm';
import './LoginPage.css'; // Reuse login page styles

const CreatePlaylistPage = () => {
    return (
        <div className="login-page">
            <main className="login-main">
                <div className="container">
                    <div className="login-container">
                        <CreatePlaylistForm />
                    </div>
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