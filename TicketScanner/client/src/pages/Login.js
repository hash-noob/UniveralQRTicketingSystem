import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { username, password } = formData;
    
    if (!username || !password) {
      setError('Please provide both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await login(username, password);
      
      if (response.success) {
        // Redirect to manage page if login successful
        navigate('/manage');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <h2>Admin Login</h2>
          
          {error && (
            <div className="error-message">
              {error}
              <button className="error-close-btn" onClick={() => setError('')}>×</button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Only administrators can access the management features.</p>
            <Link to="/" className="back-link">Back to Home</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login; 