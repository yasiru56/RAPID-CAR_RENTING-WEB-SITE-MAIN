import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import as a named function



function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editedUser, setEditedUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    firstAddress: '',
    secondAddress: '',
    city: '',
    country: '',
    postalCode: '',
    profilePhoto: null
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/user/login');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/auth/current-user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const userData = response.data.user || response.data;
        
        if (userData) {
          setUser(userData);
          setEditedUser({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            firstAddress: userData.firstAddress || '',
            secondAddress: userData.secondAddress || '',
            city: userData.city || '',
            country: userData.country || '',
            postalCode: userData.postalCode || '',
            profilePhoto: null
          });
          if (userData.profilePhoto) {
           
            const photoUrl = userData.profilePhoto.startsWith('http') 
              ? userData.profilePhoto 
              : `http://localhost:5001${userData.profilePhoto}`;
            setProfilePreview(photoUrl);
          }
        } else {
          throw new Error('No user data found in response');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set file for upload
      setEditedUser(prevState => ({
        ...prevState,
        profilePhoto: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append text fields
      formData.append('firstName', editedUser.firstName);
      formData.append('lastName', editedUser.lastName);
      formData.append('email', editedUser.email);
      formData.append('firstAddress', editedUser.firstAddress);
      formData.append('secondAddress', editedUser.secondAddress);
      formData.append('city', editedUser.city);
      formData.append('country', editedUser.country);
      formData.append('postalCode', editedUser.postalCode);

      // Append profile photo if exists
      if (editedUser.profilePhoto instanceof File) {
        formData.append('profilePhoto', editedUser.profilePhoto);
      }

      const response = await axios.put('http://localhost:5001/api/auth/update-profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update state with the new profile photo URL from the response
      const updatedUser = response.data.user;
      setUser(updatedUser);
      if (updatedUser.profilePhoto) {
        const photoUrl = updatedUser.profilePhoto.startsWith('http') 
          ? updatedUser.profilePhoto 
          : `http://localhost:5001${updatedUser.profilePhoto}`;
        setProfilePreview(photoUrl);
      }
      
      setEditMode(false);
      setLoading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update profile');
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/user/login');
  };


  
const handleDeleteAccount = async () => {
  if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete('http://localhost:5001/api/auth/delete-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to delete account');
    }
  }
};


const generatePDFReport = () => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(13, 110, 253); // Bootstrap primary color
  doc.rect(0, 0, 210, 40, 'F'); // Header background
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255); // White text
  doc.text("User Profile Report", 105, 25, { align: 'center' });

  // Subheader
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Black text
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 50);

  // Profile Photo (if available)
  if (profilePreview) {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Handle CORS if needed
      img.src = profilePreview;
      img.onload = () => {
        doc.addImage(img, 'JPEG', 150, 60, 40, 40); // Position and size of image
        addTable(doc); // Add table after image loads
        doc.save(`${user.firstName}_${user.lastName}_Profile_Report.pdf`);
      };
    } catch (e) {
      console.error('Image loading error:', e);
      addTable(doc); // Proceed without image if it fails
      doc.save(`${user.firstName}_${user.lastName}_Profile_Report.pdf`);
    }
  } else {
    addTable(doc); // No image, just add table
    doc.save(`${user.firstName}_${user.lastName}_Profile_Report.pdf`);
  }
};

// Helper function to add table
const addTable = (doc) => {
  doc.setFontSize(16);
  doc.setTextColor(13, 110, 253);
  doc.text("Profile Details", 10, profilePreview ? 110 : 70);

  // Table data
  const tableData = [
    ["First Name", user.firstName || 'Not specified'],
    ["Last Name", user.lastName || 'Not specified'],
    ["Email", user.email || 'Not specified'],
    ["Primary Address", user.firstAddress || 'Not specified'],
    ["Secondary Address", user.secondAddress || 'Not specified'],
    ["City", user.city || 'Not specified'],
    ["Country", user.country || 'Not specified'],
    ["Postal Code", user.postalCode || 'Not specified'],
  ];

  // AutoTable for a clean, styled table
  autoTable(doc, {
    startY: profilePreview ? 120 : 80,
    head: [['Field', 'Value']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [13, 110, 253], textColor: 255 },
    styles: { fontSize: 12, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Generated by RapidRent", 105, doc.internal.pageSize.height - 10, { align: 'center' });
};



  if (loading && !editMode) return (
    <div className="container text-center mt-5">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading your profile...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> {error}
        <button type="button" className="btn-close" onClick={() => setError('')}></button>
      </div>
    </div>
  );

  if (!user) return (
    <div className="container mt-5">
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        No user data available. Please try to log in again.
      </div>
    </div>
  );

  const renderViewMode = () => (
    <div className="card-body p-4">
      <div className="row align-items-center">
        <div className="col-md-4 text-center mb-4 mb-md-0">
          <div className="position-relative d-inline-block">
            <img 
              src={profilePreview || '/default-avatar.png'} 
              alt="Profile" 
              className="rounded-circle img-thumbnail shadow-lg"
              style={{ 
                width: '220px', 
                height: '220px', 
                objectFit: 'cover',
                border: '3px solid #0d6efd'
              }}
            />
            <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 border border-3 border-white">
              <i className="bi bi-person-fill text-white fs-5"></i>
            </div>
          </div>
        </div>
        <div className="col-md-8">
        <h2 className="fw-bold text-primary mb-3">
  {user.firstName} {user.lastName}
  {user.role === 'admin' && (
    <span className="badge bg-success ms-2">
      <i className="bi bi-shield-check me-1"></i>Admin
    </span>
  )}
  {user.role === 'owner' && (
    <span className="badge bg-info ms-2">
      <i className="bi bi-briefcase-fill me-1"></i>Owner
    </span>
  )}
</h2>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <h5 className="text-muted mb-1"><i className="bi bi-envelope-fill me-2 text-primary"></i>Email</h5>
                <p className="fs-5">{user.email}</p>
              </div>
              
              <div className="mb-3">
                <h5 className="text-muted mb-1"><i className="bi bi-house-door-fill me-2 text-primary"></i>Primary Address</h5>
                <p className="fs-5">{user.firstAddress || 'Not specified'}</p>
              </div>
              
              <div className="mb-3">
                <h5 className="text-muted mb-1"><i className="bi bi-building me-2 text-primary"></i>City</h5>
                <p className="fs-5">{user.city || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <h5 className="text-muted mb-1"><i className="bi bi-house-add-fill me-2 text-primary"></i>Secondary Address</h5>
                <p className="fs-5">{user.secondAddress || 'Not specified'}</p>
              </div>
              
              <div className="mb-3">
                <h5 className="text-muted mb-1"><i className="bi bi-globe me-2 text-primary"></i>Country</h5>
                <p className="fs-5">{user.country || 'Not specified'}</p>
              </div>
              
              <div className="mb-3">
                <h5 className="text-muted mb-1"><i className="bi bi-mailbox me-2 text-primary"></i>Postal Code</h5>
                <p className="fs-5">{user.postalCode || 'Not specified'}</p>
              </div>
            </div>
            <button 
              onClick={handleDeleteAccount} 
            className="btn btn-outline-danger ms-2"
                                                    >
  <i className="bi bi-trash-fill me-2"></i>Delete Account
</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="card-body p-4">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-4 position-relative">
          <input 
            type="file" 
            id="profilePhotoUpload"
            accept="image/*"
            onChange={handleFileChange}
            className="d-none"
          />
          <label htmlFor="profilePhotoUpload" className="cursor-pointer">
            <div className="position-relative d-inline-block">
              <img 
                src={profilePreview || '/default-avatar.png'} 
                alt="Profile" 
                className="rounded-circle img-thumbnail shadow-lg"
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  border: '3px solid #0d6efd'
                }}
              />
              <div 
                className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 border border-3 border-white"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <i className="bi bi-camera-fill fs-5"></i>
              </div>
            </div>
          </label>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <progress value={uploadProgress} max="100" className="w-100" style={{ height: '8px' }}></progress>
              <small className="text-muted">Uploading: {uploadProgress}%</small>
            </div>
          )}
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">First Name</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
              <input 
                type="text" 
                className="form-control" 
                name="firstName"
                value={editedUser.firstName}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Last Name</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
              <input 
                type="text" 
                className="form-control" 
                name="lastName"
                value={editedUser.lastName}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Email</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
            <input 
              type="email" 
              className="form-control" 
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
              required 
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Primary Address</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-house-door-fill"></i></span>
            <input 
              type="text" 
              className="form-control" 
              name="firstAddress"
              value={editedUser.firstAddress || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Secondary Address</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-house-add-fill"></i></span>
            <input 
              type="text" 
              className="form-control" 
              name="secondAddress"
              value={editedUser.secondAddress || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">City</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-building"></i></span>
              <input 
                type="text" 
                className="form-control" 
                name="city"
                value={editedUser.city || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Country</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-globe"></i></span>
              <input 
                type="text" 
                className="form-control" 
                name="country"
                value={editedUser.country || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Postal Code</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-mailbox"></i></span>
              <input 
                type="text" 
                className="form-control" 
                name="postalCode"
                value={editedUser.postalCode || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary px-4"
            onClick={() => setEditMode(false)}
            disabled={loading}
          >
            <i className="bi bi-x-circle me-2"></i>Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      
    <div className="container py-5">
      <div className="text-center mb-5">
      
      </div>
      
      <div className="card shadow-lg animate__animated animate__fadeInUp">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center py-3">
          <h2 className="mb-0">
            <i className="bi bi-person-badge me-2"></i>
            User Profile
          </h2>
          <div>


          <button 
            onClick={generatePDFReport} 
            className="btn  mt-3 custom-yellow-btn"
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Generate PDF Report
          </button>

            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)} 
                className="btn  me-2 custom-lightblue-btn"
              >
                <i className="bi bi-pencil-fill me-2"></i>Edit Profile
              </button>
            ) : null}
            <button 
              onClick={handleLogout} 
              className="btn btn-danger"
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
        
        {editMode ? renderEditMode() : renderViewMode()}
      </div>


     
    </div>


    </div>

  );
}

export default UserProfile;