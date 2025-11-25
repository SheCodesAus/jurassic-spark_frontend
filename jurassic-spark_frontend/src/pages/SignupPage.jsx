import React from 'react';
import SignupForm from '../components/SignupForm';
import './LoginPage.css'; // Reuse login page styles

const SignupPage = () => {
    return (
        <div className="login-page">
            <main className="login-main">
                <div className="container">
                    <div className="login-container">
                        <SignupForm />
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

export default SignupPage;