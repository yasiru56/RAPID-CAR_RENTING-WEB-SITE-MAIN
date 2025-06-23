import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Services/api'; // Import the centralized API service
import './VehicleOwnerList.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';

// Base64 car placeholder for vehicles without images
const carPlaceholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlOWVjZWYiLz48cGF0aCBkPSJNMTUwIDEzMEg1MGMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHYtMTBjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMGg1LjQzOGwzLjA2OC0xNS4zNDJDNTkuODEyIDc2LjYzNiA2Ny4yNjggNzAgNzYuMzI5IDcwaDE4LjI1QzEwMy45MTkgNzAgMTEyIDc3LjE0OCAxMTIgODYuNzA5VjkwaDEuNjY3YzEwLjE4MyAwIDE3LjggOS4zMzYgMTUuNzY1IDE5LjM1M0wxMjYuMjUgMTMwSDE1MGM1LjUyMyAwIDEwLTQuNDc3IDEwLTEwdi0xMGMwLTUuNTIzLTQuNDc3LTEwLTEwLTEweiIgZmlsbD0iIzcxYjU3MSIvPjxjaXJjbGUgY3g9IjcwIiBjeT0iMTMwIiByPSIxNSIgZmlsbD0iIzM0M2E0MCIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEzMCIgcj0iMTUiIGZpbGw9IiMzNDNhNDAiLz48L3N2Zz4=";

function VehicleOwnerList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const API_BASE_URL = 'http://localhost:5001';

  // Ref for the component to be printed
  const componentRef = useRef(null);

  const generatePDF = () => {
    const element = componentRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: 'vehicle-list-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      toast.success('Report downloaded successfully!');
    }).catch(err => {
      toast.error('Failed to generate report');
      console.error('PDF generation error:', err);
    });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: `Failed to fetch vehicles: ${err.response?.data?.error || err.message}` 
      });
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteVehicle(id);
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await api.delete(`/api/vehicles/${id}`);
      toast.success('🗑️ Vehicle deleted successfully!');
      fetchVehicles();
    } catch (err) {
      toast.error(`Failed to delete vehicle: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEditClick = (id) => {
    window.location.href = `/owner/edit-vehicle/${id}`;
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      (vehicle.vehicleName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || vehicle.type === filterType;
    return matchesSearch && matchesType;
  });

  const getImageUrl = (vehicle) => {
    // Handle case where no images exist
    if (!vehicle.images || vehicle.images.length === 0) {
      return carPlaceholder;
    }
    
    // Get first image (or thumbnail if available)
    const imagePath = vehicle.thumbnail || vehicle.images[0];
    
    // Handle full URLs (like from cloud storage)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle local file paths
    return `${API_BASE_URL}/${imagePath.replace(/^\//, '')}`;
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-secondary';
    switch(status.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'rented':
        return 'bg-warning';
      case 'maintenance':
        return 'bg-danger';
      default:
        return 'bg-secondary';
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
        <h1 className='page-title text-center display-4'>Vehicle Management</h1>
        <p className="text-muted lead">Efficiently manage your vehicle inventory</p>
      </div>
      
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}
      
      <div className='card shadow-lg mb-4'>
        <div className='card-body'>
          {/* Controls */}
          <div className='row mb-4'>
            <div className='col-md-8'>
              <div className='d-flex gap-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Search vehicles by name or brand...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className='form-select'
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value='all'>All Types</option>
                  <option value='Sedan'>Sedan</option>
                  <option value='SUV'>SUV</option>
                  <option value='Sports'>Sports</option>
                  <option value='Luxury'>Luxury</option>
                </select>
              </div>
            </div>
            <div className='col-md-4 d-flex justify-content-end gap-2'>
              <Link to='/owner/add-vehicle' className='btn btn-primary btn-title shadow-sm'>
                <i className="bi bi-plus-circle me-2"></i>
                Add New Vehicle
              </Link>
              <button 
                className='btn btn-success btn-title shadow-sm'
                onClick={generatePDF}
              >
                <i className="bi bi-download me-2"></i>
                Download Report
              </button>
            </div>
          </div>
          
          {/* Table */}
          {loading ? (
            <div className='text-center py-5'>
              <div className='spinner-border text-success' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div ref={componentRef} className='table-responsive'>
              <div className='report-header d-none d-print-block'>
                <h2>Vehicle Inventory Report</h2>
                <p className='report-timestamp'>Generated on: {new Date().toLocaleString()}</p>
                <p>Total Vehicles: {filteredVehicles.length}</p>
              </div>
              <table className='table table-hover'>
                <thead className='table-light'>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Price/Day</th>
                    <th>Status</th>
                    <th className='actions-column'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
src={getImageUrl(vehicle)} 
alt={vehicle.name || 'Vehicle'} 
      className="img-thumbnail me-3"
      style={{ width: '80px', height: '60px', objectFit: 'cover' }}
/>
                          <div>
                            <div className='fw-bold'>{vehicle.name || 'Unnamed Vehicle'}</div>
                            <div>{vehicle.brand || 'Unknown'} {vehicle.year ? `- ${vehicle.year}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className='fw-bold'>{vehicle.vehicleName || 'Unnamed Vehicle'}</div>
                          <div>{vehicle.brand || 'Unknown'} {vehicle.year ? `- ${vehicle.year}` : ''}</div>
                        </div>
                      </td>
                      <td>{vehicle.type || 'Not specified'}</td>
                      <td>${vehicle.price || '0'}</td>
                      <td>
                        <span className={`badge ${getStatusClass(vehicle.status)}`}>
                          {vehicle.status || 'Not specified'}
                        </span>
                      </td>
                      <td className='actions-column'>
                        <div className='d-flex gap-2'>
                          <button 
                            className='btn btn-sm btn-outline-primary'
                            onClick={() => handleEditClick(vehicle._id)}
                          >
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => handleDeleteClick(vehicle._id, vehicle.vehicleName)}
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-5'>
              <div className='card p-5'>
                <h3 className='text-muted'>No vehicles found</h3>
                <p className='text-muted'>Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleOwnerList;
