import React, { useState } from 'react';
import './LoginForm.css';
import vibelabLogo from '../assets/VibeLab.png';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
            } else {
                const errorData = await response.json();
                setErrors({ general: errorData.message || 'Login failed. Please try again.' });
            }
        } catch (error) {
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
            } else if (value.length < 6) {
                setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
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

                {/* Forgot Password Link */}
                <div className="text-center mb-3">
                    <a href="#" className="forgot-password">Forgot your password?</a>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <button type="button" className="btn btn-secondary signup-btn">
                        Create Account
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;