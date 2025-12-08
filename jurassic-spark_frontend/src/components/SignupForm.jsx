import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import vibelabLogo from '../assets/VibeLab.png';
import { useNavigate } from "react-router";
import './SignupForm.css';

const SignupForm = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [passwordRules, setPasswordRules] = useState({
        length: false,
        letter: false,
        special: false
    });

    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // NEW: Username validation states
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    const apiUrl = import.meta.env.VITE_JURASSIC_SPARK_BACKEND_API_URL|| 'http://localhost:8000';
    console.log('signup apiUrl =', apiUrl);

    useEffect(() => {
        if (!formData.username.trim()) {
            setUsernameAvailable(null);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setCheckingUsername(true);

            try {
                const res = await fetch(
                    `${apiUrl}/api/users/check-username/?username=${formData.username}`
                );
                const data = await res.json();

                setUsernameAvailable(!data.exists);

            } catch (err) {
                console.error("Check username error:", err);
            } finally {
                setCheckingUsername(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);

    }, [formData.username, apiUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Show password rules only when user starts typing
        if (name === "password") {
            setShowPasswordRules(value.length > 0);

            setPasswordRules({
                length: value.length >= 8,
                letter: /[A-Za-z]/.test(value),
                special: /[^A-Za-z0-9]/.test(value)
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (usernameAvailable === false) {
            newErrors.username = "This username already exists. Please try another one.";
        }
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else {
            if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }
            if (!/[A-Za-z]/.test(formData.password)) {
                newErrors.password = 'Password must contain at least one letter';
            }
            if (!/[^A-Za-z0-9]/.test(formData.password)) {
                newErrors.password = 'Password must contain at least one special character (e.g. ! @ # $ ?)';
            }
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            // Minimal change: send fields expected by the backend (first_name, last_name, password2)
            const payload = {
                first_name: formData.name,
                last_name: formData.last_name,
                username: formData.username,
                password: formData.password,
                password2: formData.confirmPassword
            };

            // debug
            console.log('POST', `${apiUrl}/api/users/register/`, payload);

            const response = await fetch(`${apiUrl}/api/users/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Read raw text first (safe for empty or non-JSON responses)
            const raw = await response.text().catch(() => '');

            // Log raw response so you can inspect the server message in the console
            console.log('Signup raw response:', raw, 'status:', response.status);

            // Try parse JSON only if there's content
            let data = null;
            if (raw) {
                try { data = JSON.parse(raw); } catch (err) {
                    console.warn('Signup response not JSON:', err);
                }
            }

            // // Replace with your actual API endpoint
            // const response = await fetch('/api/register', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         name: formData.name,
            //         last_name: formData.last_name,
            //         username: formData.username,
            //         password: formData.password
            //     })
            // });

            // const data = await response.json();

            if (response.ok) {
                console.log("Registration success:", data);

                // Redirect to login page after successful signup as signup doesn't assign tokens
                navigate('/login');
            } else {
                let newErrors = {};

                if (data.username) {
                    newErrors.username = "This username already exists. Please try another one.";
                }
                if (data.password) {
                    newErrors.password = data.password.join(" ");
                }

                newErrors.general = data.message || "Registration failed. Please try again.";

                setErrors(prev => ({ ...prev, ...newErrors }));
            }

        } catch (error) {
            console.error(error);
            setErrors({ general: 'Network error. Please check your connection.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card login-card">
            <div className="logo-container">
                <img src={vibelabLogo} alt="VibeLab Logo" className="form-logo" />
                <h2 className="text-center mb-2">Create Your Account</h2>
            </div>

            <p className="text-center mb-3 subtitle">Join VibeLab and start creating your vibe!</p>

            <form onSubmit={handleSubmit} className="login-form">
                {errors.general && (
                    <div className="error-message general-error mb-2">
                        {errors.general}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="name">First Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your first name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                        required
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        placeholder="Enter your last name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={errors.last_name ? 'error' : ''}
                        required
                    />
                    {errors.last_name && <span className="error-message">{errors.last_name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error' : ''}
                        required
                    />
                    {checkingUsername && (
                        <span className="checking">Checking...</span>
                    )}

                    {usernameAvailable === true && (
                        <span className="valid">✔ Username available</span>
                    )}

                    {usernameAvailable === false && (
                        <span className="invalid">✖ Username already exists</span>
                    )}
                    {errors.username && (<span className="error-message">{errors.username}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                        required
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}

                    {/* Password Rules UI */}
                    {showPasswordRules && (
                        <div className="password-rules">
                            <p className="rules-title">Password must contain:</p>
                            <ul>
                                <li className={passwordRules.length ? "valid" : "invalid"}>
                                    {passwordRules.length ? "✔" : "✖"} At least 8 characters
                                </li>
                                <li className={passwordRules.letter ? "valid" : "invalid"}>
                                    {passwordRules.letter ? "✔" : "✖"} At least one letter
                                </li>
                                <li className={passwordRules.special ? "valid" : "invalid"}>
                                    {passwordRules.special ? "✔" : "✖"} At least one special character (e.g. ! @ # $ ?)
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        required
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
                <button
                    type="submit"
                    className={`btn btn-primary login-btn mb-3 ${isLoading ? 'btn-loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
};

export default SignupForm;