import React, { useState } from 'react';

const SignupPage = ({ onLogin, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Password Validation State
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password); // Adding Uppercase check for good measure

    const isPasswordValid = hasLength && hasNumber && hasSpecial && hasUpper;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            setError("Please fulfill all password requirements below.");
            return;
        }

        try {
            const response = await fetch(`/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (data.success) {
                onLogin(data.token, data.user); // Auto login
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection failed');
            console.error(err);
        }
    };

        return (
            <div className="container">
                <div className="rating-form" style={{ maxWidth: '450px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '24px', fontFamily: '"Playfair Display", serif' }}>Create Account</h2>

                    {error && <div className="error" style={{ textAlign: 'center', padding: '10px', background: '#ffe4e6', color: '#e11d48', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Name</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />

                            {/* Password Requirements Checklist */}
                            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                                <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>Password must contain:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div style={{ color: hasLength ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {hasLength ? '✓' : '○'} 8+ Characters
                                    </div>
                                    <div style={{ color: hasNumber ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {hasNumber ? '✓' : '○'} Number
                                    </div>
                                    <div style={{ color: hasSpecial ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {hasSpecial ? '✓' : '○'} Special Char
                                    </div>
                                    <div style={{ color: hasUpper ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {hasUpper ? '✓' : '○'} Uppercase
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!isPasswordValid}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: isPasswordValid ? '#C5A059' : '#e2e8f0',
                                color: isPasswordValid ? 'black' : '#94a3b8',
                                cursor: isPasswordValid ? 'pointer' : 'not-allowed',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                transition: 'all 0.3s'
                            }}
                        >
                            Sign Up
                        </button>
                    </form>

                    <p style={{ marginTop: '20px', textAlign: 'center', color: '#64748b' }}>
                        Already have an account? <span onClick={onSwitchToLogin} style={{ color: '#C5A059', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Login</span>
                    </p>
                </div>
            </div>
        );
    };

    export default SignupPage;
