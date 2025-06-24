import React, { useState } from 'react';
import clientrent from '../assets/clientrent.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import rapidrent from '../assets/rapidrent.jpg';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    firstAddress: '',
    secondAddress: '',
    city: '',
    country: '',
    postalCode: '',
    role: 'user'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    firstAddress: '',
    secondAddress: '',
    city: '',
    country: '',
    postalCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    validateField(name);
  };

  const validateField = (fieldName) => {
    const newErrors = { ...validationErrors };

    switch (fieldName) {
      case 'firstName':
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          newErrors.firstName = '';
        }
        break;

      case 'lastName':
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          newErrors.lastName = '';
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          newErrors.email = '';
        }
        break;

      case 'password':
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          newErrors.password = '';
        }
        break;

      case 'firstAddress':
        if (!formData.firstAddress.trim()) {
          newErrors.firstAddress = 'Address is required';
        } else {
          newErrors.firstAddress = '';
        }
        break;

      case 'city':
        if (!formData.city.trim()) {
          newErrors.city = 'City is required';
        } else {
          newErrors.city = '';
        }
        break;

      case 'country':
        if (!formData.country.trim()) {
          newErrors.country = 'Country is required';
        } else {
          newErrors.country = '';
        }
        break;

      case 'postalCode':
        if (!formData.postalCode.trim()) {
          newErrors.postalCode = 'Postal code is required';
        } else {
          newErrors.postalCode = '';
        }
        break;

      default:
        break;
    }

    setValidationErrors(newErrors);
  };

  const validateForm = () => {
    let isValid = true;
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'firstAddress', 'city', 'country', 'postalCode'];

    requiredFields.forEach(field => {
      validateField(field);
      if (validationErrors[field]) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordStrengthMeter = ({ password }) => {
    const getStrength = () => {
      if (!password) return 0;
      if (password.length < 6) return 1;
      if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 4;
      if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 3;
      return 2;
    };

    const strength = getStrength();
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['danger', 'danger', 'warning', 'info', 'success'][strength];

    return (
      <div className="mt-2">
        <div className="progress" style={{ height: '5px' }}>
          <div 
            className={`progress-bar bg-${strengthColor}`} 
            role="progressbar" 
            style={{ width: `${strength * 25}%` }}
          ></div>
        </div>
        <small className={`text-${strengthColor}`}>{strengthText}</small>
      </div>
    );
  };

  const isFormValid = Object.values(validationErrors).every(error => !error) && 
    Object.values(formData).every(field => {
      if (field === 'secondAddress' || field === 'role') return true;
      return field.trim() !== '';
    });

  return (
    <div className='container-fluid min-vh-100'>
        <img 
                        src={rapidrent} 
                        alt="Rapid Rent" 
                        className="img-fluid rounded-circle shadow" 
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'fill',
                          border: '4px solid #0d6efd',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.30)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
    
      <h1 className='display-3 mb-4 bold font-weight-bold text-center text-success'>User Registration</h1>

      
      
      <div className='row'>
        <div className='col-md-5 d-flex flex-column justify-content-center align-items-center'>
          <img 
            src={clientrent} 
            alt='Client Rent' 
            className='img-fluid rounded mx-auto d-block shadow-lg mb-4' 
            style={{objectFit:'cover', height:'100%', width:'100%'}}
          />
        </div>
        
        <div className='col-md-7'>
          <div className='card p-4 shadow-lg w-100 mb-4'>
            <h3 className='text-center mb-3'>Create an Account</h3>
            {error && <div className='alert alert-danger'>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>First Name</b></label>
                  <input 
                    type='text' 
                    className={`form-control ${validationErrors.firstName ? 'is-invalid' : ''}`}
                    placeholder='Enter your first name' 
                    name='firstName' 
                    value={formData.firstName} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={25} 
                    required 
                  />
                  {validationErrors.firstName && (
                    <div className="invalid-feedback">{validationErrors.firstName}</div>
                  )}
                </div>
                
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Last Name</b></label>
                  <input 
                    type='text' 
                    className={`form-control ${validationErrors.lastName ? 'is-invalid' : ''}`}
                    placeholder='Enter your last name' 
                    name='lastName' 
                    value={formData.lastName} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={25} 
                    required 
                  />
                  {validationErrors.lastName && (
                    <div className="invalid-feedback">{validationErrors.lastName}</div>
                  )}
                </div>
              </div>

              <div className='mb-3'>
                <label className='form-label'><b>Email</b></label>
                <input 
                  type='email' 
                  className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                  placeholder='Enter your email' 
                  name='email' 
                  value={formData.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                />
                {validationErrors.email && (
                  <div className="invalid-feedback">{validationErrors.email}</div>
                )}
              </div>

              <div className='mb-3'>
                <label className='form-label'><b>Password</b></label>
                <input 
                  type='password' 
                  className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                  placeholder='Enter your password' 
                  name='password' 
                  value={formData.password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                />
                <PasswordStrengthMeter password={formData.password} />
                {validationErrors.password && (
                  <div className="invalid-feedback">{validationErrors.password}</div>
                )}
              </div>

              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>First Address</b></label>
                  <input 
                    type='text' 
                    className={`form-control ${validationErrors.firstAddress ? 'is-invalid' : ''}`}
                    placeholder='Enter your first address' 
                    name='firstAddress' 
                    value={formData.firstAddress} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                  {validationErrors.firstAddress && (
                    <div className="invalid-feedback">{validationErrors.firstAddress}</div>
                  )}
                </div>

                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Second Address</b></label>
                  <input 
                    type='text' 
                    className='form-control'
                    placeholder='Enter your second address' 
                    name='secondAddress' 
                    value={formData.secondAddress} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>City</b></label>
                  <input 
                    type='text' 
                    className={`form-control ${validationErrors.city ? 'is-invalid' : ''}`}
                    placeholder='Enter your city' 
                    name='city' 
                    value={formData.city} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                  {validationErrors.city && (
                    <div className="invalid-feedback">{validationErrors.city}</div>
                  )}
                </div>

                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Country</b></label>
                  <input 
                    type='text' 
                    className={`form-control ${validationErrors.country ? 'is-invalid' : ''}`}
                    placeholder='Enter your country'
                    name='country' 
                    value={formData.country} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                  {validationErrors.country && (
                    <div className="invalid-feedback">{validationErrors.country}</div>
                  )}
                </div>

                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Postal Code</b></label>
                  <input 
                    type='text' 
                    className={`form-control ${validationErrors.postalCode ? 'is-invalid' : ''}`}
                    placeholder='Enter your postal code'
                    name='postalCode' 
                    value={formData.postalCode} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                  {validationErrors.postalCode && (
                    <div className="invalid-feedback">{validationErrors.postalCode}</div>
                  )}
                </div>
              </div>

              <button 
                type='submit' 
                className='btn btn-success btn-lg w-100' 
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : 'Register'}
              </button>
            </form>

            <p className='mt-3 text-center'>
              Already have an account? <a href='/user/login'>Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
