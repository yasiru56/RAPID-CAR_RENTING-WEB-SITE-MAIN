import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Carousel, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEdit, faHistory, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function VehicleDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5001/api/vehicles/${id}`, config);
        setVehicle(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleDetails();
  }, [id]);
  
  // Function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Function to render status badge
  const renderStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'Pending' },
      approved: { bg: 'success', text: 'Approved' },
      rejected: { bg: 'danger', text: 'Rejected' },
      changes_requested: { bg: 'info', text: 'Changes Requested' }
    };
    
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/admin/approvals')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Approvals
        </Button>
      </Container>
    );
  }
  
  if (!vehicle) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Vehicle not found or has been removed.</Alert>
        <Button variant="secondary" onClick={() => navigate('/admin/approvals')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Approvals
        </Button>
      </Container>
    );
  }

  // Handle approval
  const handleApprove = async () => {
    try {
      await axios.patch(`http://localhost:5001/api/vehicles/${id}/status`, {
        status: 'approved'
      }, config);
      alert('Vehicle has been approved');
      navigate('/admin/approvals');
    } catch (err) {
      console.error('Error approving vehicle:', err);
      setError('Failed to approve vehicle. Please try again.');
    }
  };

  // Handle rejection
  const handleReject = async () => {
    try {
      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;
      
      await axios.patch(`http://localhost:5001/api/vehicles/${id}/status`, {
        status: 'rejected',
        rejectionReason: reason
      }, config);
      alert('Vehicle has been rejected');
      navigate('/admin/approvals');
    } catch (err) {
      console.error('Error rejecting vehicle:', err);
      setError('Failed to reject vehicle. Please try again.');
    }
  };
  
  return (
    <Container className="py-5">
      <Button variant="secondary" className="mb-4" onClick={() => navigate('/admin/approvals')}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Approvals
      </Button>
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{vehicle.brand} {vehicle.model} ({vehicle.year})</h2>
          {renderStatusBadge(vehicle.status)}
        </Card.Header>
        
        <Card.Body>
          <Row>
            <Col md={6}>
              <Carousel>
                {vehicle.images && vehicle.images.length > 0 ? (
                  vehicle.images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100"
                        src={image}
                        alt={`${vehicle.brand} ${vehicle.model} - ${index + 1}`}
                        style={{ height: '300px', objectFit: 'cover' }}
                      />
                    </Carousel.Item>
                  ))
                ) : (
                  <Carousel.Item>
                    <div 
                      className="d-flex justify-content-center align-items-center bg-light"
                      style={{ height: '300px' }}
                    >
                      <p className="text-muted">No images available</p>
                    </div>
                  </Carousel.Item>
                )}
              </Carousel>
            </Col>
            
            <Col md={6}>
              <h4>Vehicle Details</h4>
              <Row className="mb-2">
                <Col sm={4}><strong>Owner:</strong></Col>
                <Col sm={8}>{vehicle.ownerName || 'Not specified'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>License Plate:</strong></Col>
                <Col sm={8}>{vehicle.licensePlate || 'Not specified'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Vehicle Type:</strong></Col>
                <Col sm={8}>{vehicle.type || 'Not specified'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Transmission:</strong></Col>
                <Col sm={8}>{vehicle.transmission || 'Not specified'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Fuel Type:</strong></Col>
                <Col sm={8}>{vehicle.fuelType || 'Not specified'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Price:</strong></Col>
                <Col sm={8}>LKR {vehicle.price || 'Not specified'} per day</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Location:</strong></Col>
                <Col sm={8}>{vehicle.location || 'Not specified'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Submitted:</strong></Col>
                <Col sm={8}>{formatDate(vehicle.createdAt)}</Col>
              </Row>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col>
              <h4>Vehicle Description</h4>
              <p>{vehicle.description || 'No description provided.'}</p>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col>
              <h4>Features</h4>
              {vehicle.features && vehicle.features.length > 0 ? (
                <ul>
                  {vehicle.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p>No features specified.</p>
              )}
            </Col>
          </Row>
        </Card.Body>
        
        <Card.Footer>
          {vehicle.status === 'pending' && (
            <div className="d-flex justify-content-end gap-2">
              <Button variant="success" onClick={handleApprove}>
                <FontAwesomeIcon icon={faCheck} /> Approve
              </Button>
              <Button variant="danger" onClick={handleReject}>
                <FontAwesomeIcon icon={faTimes} /> Reject
              </Button>
            </div>
          )}
          
          {vehicle.status === 'rejected' && (
            <div>
              <h5>Rejection Reason:</h5>
              <p>{vehicle.rejectionReason || 'No reason provided'}</p>
            </div>
          )}
        </Card.Footer>
      </Card>
    </Container>
  );
}