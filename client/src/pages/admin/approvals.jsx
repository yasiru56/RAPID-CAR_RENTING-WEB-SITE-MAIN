import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './approvals.css';
import { Tab, Tabs, Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEdit, faHistory, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function AdminApprovals() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Get auth token for API calls
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  // Fetch vehicles based on active tab
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        let endpoint = 'http://localhost:5001/api/vehicles';
        
        if (activeTab !== 'all') {
          endpoint += `/status/${activeTab}`;
        }
        
        const res = await axios.get(endpoint, config);
        setVehicles(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [activeTab]);

  // Handle modal for approval/rejection/changes
  const openActionModal = (vehicle, action) => {
    setSelectedVehicle(vehicle);
    setModalAction(action);
    setFeedback('');
    setShowModal(true);
  };

  // Open history modal
  const openHistoryModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHistoryModal(true);
  };

  // Process approval/rejection/changes request
  const handleAction = async () => {
    try {
      let endpoint = `http://localhost:5001/api/vehicles/${selectedVehicle._id}`;
      let data = { feedback };
      
      switch (modalAction) {
        case 'approve':
          endpoint += '/approve';
          break;
        case 'reject':
          endpoint += '/reject';
          break;
        case 'request-changes':
          endpoint += '/request-changes';
          break;
        default:
          return;
      }
      
      await axios.patch(endpoint, data, config);
      
      // Update local state
      setVehicles(vehicles.filter(v => v._id !== selectedVehicle._id));
      setShowModal(false);
      
      // Show success message
      alert(`Vehicle ${modalAction === 'approve' ? 'approved' : modalAction === 'reject' ? 'rejected' : 'sent back for changes'} successfully`);
    } catch (err) {
      console.error('Action failed:', err);
      alert(`Failed to ${modalAction} vehicle. Please try again.`);
    }
  };

  return (
    <div className="admin-approvals">
      <h1>Vehicle Approval Management</h1>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="pending" title={`Pending (${vehicles.filter(v => v.approvalStatus === 'pending').length})`} />
        <Tab eventKey="changes_requested" title="Changes Requested" />
        <Tab eventKey="approved" title="Approved" />
        <Tab eventKey="rejected" title="Rejected" />
        <Tab eventKey="all" title="All" />
      </Tabs>
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : vehicles.length === 0 ? (
        <div className="alert alert-info">No vehicles found for this status.</div>
      ) : (
        <div className="submission-list">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="submission-card">
              <div className="vehicle-images">
                {vehicle.images && vehicle.images.length > 0 ? (
                  vehicle.images.map((img, index) => (
                    <img 
                      key={index} 
                      src={`http://localhost:5001/${img}`} 
                      alt={`Vehicle Preview ${index + 1}`} 
                      className="mb-2"
                    />
                  ))
                ) : (
                  <div className="no-image">No images available</div>
                )}
              </div>
              
              <div className="vehicle-details">
                <h3>{vehicle.name}</h3>
                <p>Type: {vehicle.type}</p>
                <p>Price: ${vehicle.price}/day</p>
                <p>Location: {vehicle.location}</p>
                <p>Description: {vehicle.description}</p>
                <p>Status: <span className={`status-badge status-${vehicle.approvalStatus}`}>{vehicle.approvalStatus}</span></p>
                
                {vehicle.adminFeedback && (
                  <div className="admin-feedback">
                    <h5>Admin Feedback:</h5>
                    <p>{vehicle.adminFeedback}</p>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                {vehicle.approvalStatus === 'pending' && (
                  <>
                    <button 
                      className="action-btn approve-btn"
                      onClick={() => openActionModal(vehicle, 'approve')}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Approve
                    </button>
                    <button 
                      className="action-btn reject-btn"
                      onClick={() => openActionModal(vehicle, 'reject')}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Reject
                    </button>
                    <button 
                      className="action-btn changes-btn"
                      onClick={() => openActionModal(vehicle, 'request-changes')}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Request Changes
                    </button>
                  </>
                )}
                
                {vehicle.approvalStatus === 'rejected' && (
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => openActionModal(vehicle, 'approve')}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Approve Instead
                  </button>
                )}
                
                {vehicle.approvalStatus === 'approved' && (
                  <button 
                    className="action-btn reject-btn"
                    onClick={() => openActionModal(vehicle, 'reject')}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Revoke Approval
                  </button>
                )}
                
                <button 
                  className="action-btn history-btn"
                  onClick={() => openHistoryModal(vehicle)}
                >
                  <FontAwesomeIcon icon={faHistory} /> View History
                </button>
                
                <a 
                  href={`/admin/vehicles/${vehicle._id}`}
                  className="action-btn details-btn"
                >
                  <FontAwesomeIcon icon={faInfoCircle} /> Full Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === 'approve' ? 'Approve Vehicle' : 
             modalAction === 'reject' ? 'Reject Vehicle' : 'Request Changes'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVehicle && (
            <>
              <p>
                You are about to <strong>
                  {modalAction === 'approve' ? 'approve' : 
                   modalAction === 'reject' ? 'reject' : 'request changes for'}
                </strong> the vehicle: <strong>{selectedVehicle.name}</strong>
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Feedback to owner (optional for approvals, required for rejections/changes)</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={modalAction === 'approve' ? 
                    "Great vehicle! Approved for the catalog." : 
                    modalAction === 'reject' ? 
                    "Please provide a reason for rejection..." : 
                    "Please explain what changes are needed..."}
                  required={modalAction !== 'approve'}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={
              modalAction === 'approve' ? 'success' : 
              modalAction === 'reject' ? 'danger' : 'warning'
            } 
            onClick={handleAction}
            disabled={(modalAction !== 'approve' && !feedback.trim())}
          >
            Confirm {modalAction === 'approve' ? 'Approval' : modalAction === 'reject' ? 'Rejection' : 'Request Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Approval History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVehicle && selectedVehicle.approvalHistory && selectedVehicle.approvalHistory.length > 0 ? (
            <div className="approval-history">
              <h5>Vehicle: {selectedVehicle.name}</h5>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status Change</th>
                    <th>Feedback</th>
                    <th>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVehicle.approvalHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${record.status}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.feedback || '-'}</td>
                      <td>{record.updatedBy ? `${record.updatedBy.firstName} ${record.updatedBy.lastName}` : 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No history available for this vehicle.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
