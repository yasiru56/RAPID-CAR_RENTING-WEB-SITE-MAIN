import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import manager from '../assets/manager.webp'; // Use the same image for consistency

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

// In your AdminLogin component
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5001/api/auth/admin/login', formData);
      
      // Store authentication data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Check if the user is an admin before redirecting
      if (response.data.user.role === 'admin') {
        navigate('/admin/home');
      } else {
        setError("You don't have admin privileges");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const checkFirstAdmin = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/auth/check-admins');
      if (!response.data.hasAdmins) {
        navigate('/admin/first-register');
      }
    } catch (error) {
      console.error("Error checking admins:", error);
    }
  };

  // Check if this is the first admin when component mounts
  useEffect(() => {
    checkFirstAdmin();
  }, []);

  return (
    <div className='container-fluid min-vh-100'>
      <h1 className='display-3 mb-4 bold font-weight-bold text-center text-success'>Admin Login</h1>
      <div className='row'>
        <div className='col-md-5 d-flex flex-column justify-content-center align-items-center'>
          <img 
            src={manager} 
            alt='Admin Login' 
            className='img-fluid rounded mx-auto d-block shadow-lg mb-4' 
            style={{objectFit:'cover', height:'100%', width:'100%'}}
          />
        </div>
        
        <div className='col-md-7'>
          <div className='card p-4 shadow-lg w-100 mb-4'>
            <h3 className='text-center mb-3'>Login to Admin Account</h3>
            {error && <div className='alert alert-danger'>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className='mb-3'>
                <label className='form-label'><b>Email</b></label>
                <input 
                  type='email' 
                  className='form-control' 
                  placeholder='Enter your email' 
                  name='email' 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className='mb-3'>
                <label className='form-label'><b>Password</b></label>
                <input 
                  type='password' 
                  className='form-control' 
                  placeholder='Enter your password' 
                  name='password' 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <button 
                type='submit' 
                className='btn btn-success btn-lg' 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className='mt-3'>
              Don't have an admin account? <a href='/admin/first-register'>Register First Admin</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
