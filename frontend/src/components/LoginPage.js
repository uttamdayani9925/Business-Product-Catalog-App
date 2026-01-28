import React, { useState } from 'react';

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                onLogin(data.token, data.user);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="container">
            <div className="rating-form" style={{ maxWidth: '400px', margin: '60px auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Login</h2>
                {error && <div className="error" style={{ textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
                <p style={{ marginTop: '16px', textAlign: 'center' }}>
                    Don't have an account? <span onClick={onSwitchToSignup} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
