import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './VehicleForm.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Base64 car placeholder instead of external file
const carPlaceholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlOWVjZWYiLz48cGF0aCBkPSJNMTUwIDEzMEg1MGMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHYtMTBjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMGg1LjQzOGwzLjA2OC0xNS4zNDJDNTkuODEyIDc2LjYzNiA2Ny4yNjggNzAgNzYuMzI5IDcwaDE4LjI1QzEwMy45MTkgNzAgMTEyIDc3LjE0OCAxMTIgODYuNzA5VjkwaDEuNjY3YzEwLjE4MyAwIDE3LjggOS4zMzYgMTUuNzY1IDE5LjM1M0wxMjYuMjUgMTMwSDE1MGM1LjUyMyAwIDEwLTQuNDc3IDEwLTEwdi0xMGMwLTUuNTIzLTQuNDc3LTEwLTEwLTEweiIgZmlsbD0iIzcxYjU3MSIvPjxjaXJjbGUgY3g9IjcwIiBjeT0iMTMwIiByPSIxNSIgZmlsbD0iIzM0M2E0MCIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEzMCIgcj0iMTUiIGZpbGw9IiMzNDNhNDAiLz48L3N2Zz4=";

function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [vehicle, setVehicle] = useState({
    name: '',
    brand: '',
    year: '',
    type: '',
    price: '',
    ownerContact: '',
    location: '',
    description: '',
    status: 'Available',
  });
  const [images, setImages] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({
    ownerContact: '',
    year: '',
    price: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to add or edit vehicles');
      navigate('/login');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = window.atob(base64);
      const user = JSON.parse(jsonPayload);

      console.log("Decoded token:", user);

      setUserData(user);
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error('Authentication error. Please login again.');
      navigate('/login');
    }

    if (id) {
      fetchVehicle();
    }
  }, [id, navigate]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/vehicles/${id}`);
      setVehicle(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch vehicle:', err);
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    if (cleanNumber.length !== 10) {
      return false;
    }
    const validPrefixes = ['070', '071', '072', '075', '076', '077', '078'];
    const prefix = cleanNumber.substring(0, 3);
    return validPrefixes.includes(prefix);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'ownerContact') {
      const phoneNumber = value.replace(/[^\d]/g, '').slice(0, 10);

      setVehicle({
        ...vehicle,
        [name]: phoneNumber
      });

      if (phoneNumber.length > 0) {
        if (!validatePhoneNumber(phoneNumber)) {
          setErrors({
            ...errors,
            ownerContact: 'Please enter a valid 10-digit Sri Lankan mobile number'
          });
        } else {
          setErrors({
            ...errors,
            ownerContact: ''
          });
        }
      } else {
        setErrors({
          ...errors,
          ownerContact: ''
        });
      }
    } else {
      setVehicle({
        ...vehicle,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    if (files.length > 0) {
      const previewURL = URL.createObjectURL(files[0]);
      setPreviewUrl(previewURL);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      ownerContact: '',
      year: '',
      price: ''
    };

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(vehicle.ownerContact)) {
      newErrors.ownerContact = 'Phone number must be exactly 10 digits';
      isValid = false;
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(vehicle.year);
    if (!yearNum || yearNum < 1900 || yearNum > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
      isValid = false;
    }

    const priceNum = parseFloat(vehicle.price);
    if (!priceNum || priceNum <= 0 || priceNum > 1000000) {
      newErrors.price = 'Price must be greater than 0 and less than 1,000,000';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePhoneNumber(vehicle.ownerContact)) {
      setErrors({
        ...errors,
        ownerContact: 'Please enter a valid 10-digit Sri Lankan mobile number'
      });
      setLoading(false);
      return;
    }

    if (!userData || !userData.id) {
      console.error("Missing user data:", userData);
      toast.error('User information missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(vehicle).forEach(key => {
        if (key !== '_id' && key !== '__v' && key !== 'images') {
          formData.append(key, vehicle[key]);
        }
      });

      formData.append('owner', userData.id);
      formData.append('ownerEmail', userData.email);

      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      if (images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      if (id && vehicle.images && vehicle.images.length > 0) {
        formData.append('existingImages', JSON.stringify(vehicle.images));
      }

      const token = localStorage.getItem('token');

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      let response;

      if (id) {
        console.log(`Updating vehicle with ID: ${id}`);
        response = await axios.put(
          `http://localhost:5001/api/vehicles/${id}`,
          formData,
          config
        );
      } else {
        console.log("Creating new vehicle");
        response = await axios.post(
          'http://localhost:5001/api/vehicles',
          formData,
          config
        );
      }

      console.log('Server response:', response.data);
      toast.success(`Vehicle ${id ? 'updated' : 'created'} successfully!`);
      navigate('/owner/dashboard');

    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-fluid min-vh-100'>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="text-center mt-4 mb-5">
        <h1 className='page-title text-center display-4'>
          {id ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h1>
        <p className="text-muted lead">
          {id ? 'Update the details of your vehicle' : 'Enter details to add a new vehicle to your fleet'}
        </p>
      </div>

      {message.text && (
        <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1050, marginTop: "60px" }}>
          <div className={`alert alert-${message.type} alert-dismissible fade show shadow-lg`} role="alert">
            <strong>{message.text}</strong>
            <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        </div>
      )}

      <div className='row'>
        <div className='col-md-5 d-flex flex-column justify-content-center align-items-center'>
          <img
            src={previewUrl || carPlaceholder}
            alt='Vehicle'
            className='img-fluid rounded mx-auto d-block shadow-lg mb-4'
            style={{ objectFit: 'cover', height: 'auto', width: '100%' }}
          />
          <div className="mb-4 w-100">
            <label className="form-label"><b>Upload Images</b></label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
              multiple
            />
          </div>
        </div>

        <div className='col-md-7'>
          <div className='card p-4 shadow-lg w-100 mb-4'>
            <h3 className='text-center mb-3'>Vehicle Information</h3>
            <form onSubmit={handleSubmit}>
              {userData && (
                <>
                  <input type="hidden" name="owner" value={userData.id || ''} />
                  <input type="hidden" name="ownerEmail" value={userData.email || ''} />
                </>
              )}

              {userData && (
                <div className="alert alert-info mb-3">
                  <small>
                    Logged in as: {userData.email} (ID: {userData.id})
                  </small>
                </div>
              )}

              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Vehicle Name</b></label>
                  <input
                    type='text'
                    name='name'
                    value={vehicle.name}
                    onChange={handleChange}
                    className='form-control'
                    placeholder='Enter vehicle name'
                    required
                  />
                </div>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Brand</b></label>
                  <input
                    type='text'
                    name='brand'
                    value={vehicle.brand}
                    onChange={handleChange}
                    className='form-control'
                    placeholder='Enter brand'
                    required
                  />
                </div>
              </div>

              <div className='row'>
                <div className='col-md-4 mb-3'>
                  <label className='form-label'><b>Year</b></label>
                  <input
                    type='number'
                    name='year'
                    value={vehicle.year}
                    onChange={handleChange}
                    className={`form-control ${errors.year ? 'is-invalid' : ''}`}
                    placeholder='Enter year'
                    required
                  />
                  {errors.year && (
                    <div className="invalid-feedback">
                      {errors.year}
                    </div>
                  )}
                </div>
                <div className='col-md-4 mb-3'>
                  <label className='form-label'><b>Type</b></label>
                  <select
                    name='type'
                    value={vehicle.type}
                    onChange={handleChange}
                    className='form-select'
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div className='col-md-4 mb-3'>
                  <label className='form-label'><b>Price ($/day)</b></label>
                  <input
                    type='number'
                    name='price'
                    value={vehicle.price}
                    onChange={handleChange}
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    placeholder='Enter price'
                    required
                  />
                  {errors.price && (
                    <div className="invalid-feedback">
                      {errors.price}
                    </div>
                  )}
                </div>
              </div>

              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'>
                    <b>Owner Contact</b>
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type='tel'
                    name='ownerContact'
                    value={vehicle.ownerContact}
                    onChange={handleChange}
                    className={`form-control ${errors.ownerContact ? 'is-invalid' : ''}`}
                    placeholder='Enter 10-digit mobile number (07X-XXXXXXX)'
                    required
                  />
                  {errors.ownerContact && (
                    <div className="invalid-feedback">
                      {errors.ownerContact}
                    </div>
                  )}
                  <small className="text-muted">
                    Format: 07X-XXXXXXX (Sri Lankan mobile number)
                  </small>
                </div>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'><b>Location</b></label>
                  <input
                    type='text'
                    name='location'
                    value={vehicle.location}
                    onChange={handleChange}
                    className='form-control'
                    placeholder='Enter location'
                    required
                  />
                </div>
              </div>

              <div className='mb-3'>
                <label className='form-label'><b>Description</b></label>
                <textarea
                  name='description'
                  value={vehicle.description}
                  onChange={handleChange}
                  className='form-control'
                  placeholder='Enter vehicle description'
                  rows='4'
                  required
                ></textarea>
              </div>

              <div className='mb-3'>
                <label className='form-label'><b>Status</b></label>
                <select
                  name='status'
                  value={vehicle.status}
                  onChange={handleChange}
                  className='form-select'
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className='d-grid gap-2'>
                <button type='submit' className='btn btn-primary btn-lg btn-title shadow-sm'>
                  <i className="bi bi-check-circle me-2"></i>
                  {id ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => navigate('/vehicles')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 border rounded">
          <h5>Debug Info:</h5>
          <pre className="bg-light p-2">
            {JSON.stringify({
              userData,
              vehicleOwner: vehicle.owner,
              vehicleOwnerEmail: vehicle.ownerEmail
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default VehicleForm;

