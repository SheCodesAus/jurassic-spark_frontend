import React from 'react';
import LoginForm from '../components/LoginForm'; // ADD THIS LINE
import './LoginPage.css';

const LoginPage = () => {
    return (
        <div className="login-page">

            {/* Main Content */}
            <main className="login-main">
                <div className="container">
                    <div className="login-container">
                        {/* Login Form Component */}
                        <LoginForm />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="login-footer">
                <div className="container text-center">
                    <p>&copy; 2025 VibeLab. Building connections through music.</p>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;