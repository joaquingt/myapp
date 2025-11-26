import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.login({ username, password });
      
      if (response.success && response.data) {
        login(response.data.token, response.data.technician);
        navigate('/dashboard');
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="company-logo">
            <div className="logo-icon">🔧</div>
            <h1>B2Bgeeks</h1>
          </div>
          <p className="login-subtitle">Technician Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="login-button"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="demo-accounts">
          <h3>Demo Accounts</h3>
          <div className="demo-account-list">
            <div className="demo-account">
              <strong>humberto.b2b</strong> / password123
            </div>
            <div className="demo-account">
              <strong>sarah.field</strong> / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;