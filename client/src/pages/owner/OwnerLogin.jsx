import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import owner from '../assets/owner.webp';

function OwnerLogin() {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5001/api/auth/owner/login', formData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            if (response.data.user.role === 'owner') {
                navigate('/owner/home');
            } else {
                setError("You don't have owner privileges");
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

    return (
        <div className='container-fluid min-vh-100'>
            <h1 className='display-3 mb-4 bold font-weight-bold text-center text-primary'>Owner Login</h1>
            <div className='row'>
                <div className='col-md-5 d-flex flex-column justify-content-center align-items-center'>
                    <img
                        src={owner}
                        alt='Owner Login'
                        className='img-fluid rounded mx-auto d-block shadow-lg mb-4'
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                </div>

                <div className='col-md-7'>
                    <div className='card p-4 shadow-lg w-100 mb-4'>
                        <h3 className='text-center mb-3'>Login to Owner Account</h3>
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
                                className='btn btn-primary btn-lg'
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <p className='mt-3'>
                            Don't have an owner account? <a href='/owner/register'>Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OwnerLogin;