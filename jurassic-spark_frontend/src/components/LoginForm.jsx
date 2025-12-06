import React, { useState } from 'react';
import './LoginForm.css';
import vibelabLogo from '../assets/VibeLab.png';
import { useNavigate } from "react-router";
import useAuth from '../hooks/useAuth';

const LoginForm = () => {


    const { setAuth } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL;
    console.log("LoginForm apiURL:", apiUrl);

    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Replace with your actual API endpoint
            const response = await fetch(`${apiUrl}/api/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                                const data = await response.json();
                                console.log('Login successful:', data);

                                // Store JWT and user ID in localStorage after successful login
                                localStorage.setItem('jwt_token', data.token || data.access); // Use the correct key from backend
                                // Store only numeric user_id from backend
                                if (typeof data.user_id === 'number' && !isNaN(data.user_id)) {
                                    localStorage.setItem('user_id', data.user_id);
                                    console.log('Saved user_id to localStorage:', data.user_id);
                                } else {
                                    localStorage.removeItem('user_id');
                                    console.warn('No valid numeric user_id found in login response:', data.user_id);
                                }

                                // Optionally store refresh token if needed
                                if (data.refresh) {
                                    localStorage.setItem('refresh_token', data.refresh);
                                }

                                //update auth context
                                setAuth({ access_token: data.token || data.access, refresh_token: data.refresh });

                                // Redirect to home page 
                                navigate('/')

            } else {
                const errorData = await response.json();
                setErrors({ general: errorData.message || 'Login failed. Please try again.' });
            }
        } catch (error) {
            console.log(error)

            setErrors({ general: 'Network error. Please check your connection.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input blur for real-time validation
    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (name === 'username' && !value.trim()) {
            setErrors(prev => ({ ...prev, username: 'Username is required' }));
        } else if (name === 'password') {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, password: 'Password is required' }));
            } else if (value.length < 8) {
                setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
            }
        }
    };

    return (
        <div className="card login-card">

            <div className="logo-container">
                <img
                    src={vibelabLogo}
                    alt="VibeLab Logo"
                    className="form-logo"
                />
                <h2 className="text-center mb-2">Welcome Back!</h2>
            </div>

            <p className="text-center mb-3 subtitle">Ready to create the perfect vibe?</p>

            <form onSubmit={handleSubmit} className="login-form">
                {errors.general && (
                    <div className="error-message general-error mb-2">
                        {errors.general}
                    </div>
                )}

                {/* Username Field */}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.username ? 'error' : ''}
                        required
                    />
                    {errors.username && (
                        <span className="error-message">{errors.username}</span>
                    )}
                </div>

                {/* Password Field */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.password ? 'error' : ''}
                        required
                    />
                    {errors.password && (
                        <span className="error-message">{errors.password}</span>
                    )}
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    className={`btn btn-primary login-btn mb-3 ${isLoading ? 'btn-loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>

                <div className="text-center or-text">
                    or
                </div>

                {/*Create Account */}
                <div className="text-center">
                    <a href="/signup" className="create-account-link">
                        Create Account
                    </a>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;