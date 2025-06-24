import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingSuggestion.css';

function BookingSuggestion({ suggestion, onAccept, onDismiss }) {
  const [startDate, setStartDate] = useState(
    suggestion.suggestedDates && suggestion.suggestedDates.length > 0
      ? new Date(suggestion.suggestedDates[0])
      : new Date()
  );
  
  const [endDate, setEndDate] = useState(
    suggestion.suggestedDates && suggestion.suggestedDates.length > 1
      ? new Date(suggestion.suggestedDates[1])
      : new Date(Date.now() + 86400000) // tomorrow
  );
  
  const handleAccept = () => {
    onAccept({
      startDate,
      endDate
    });
  };
  
  return (
    <div className="booking-suggestion">
      <div className="suggestion-header">
        <span className="ai-label">
          <i className="bi bi-robot"></i> AI Assistant
        </span>
        <button className="close-btn" onClick={onDismiss}>×</button>
      </div>
      
      <div className="suggestion-content">
        <p>{suggestion.message}</p>
        
        {suggestion.vehicleDetails && (
          <div className="vehicle-details">
            <h4>{suggestion.vehicleDetails.name}</h4>
            <p>LKR {suggestion.vehicleDetails.price} per day</p>
            <p><i className="bi bi-geo-alt"></i> {suggestion.vehicleDetails.location}</p>
          </div>
        )}
        
        <div className="date-selection">
          <div className="date-range">
            <label>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              className="date-picker"
            />
          </div>
          
          <div className="date-range">
            <label>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="date-picker"
            />
          </div>
        </div>
      </div>
      
      <div className="suggestion-actions">
        <button className="secondary-btn" onClick={onDismiss}>Not Now</button>
        <button className="primary-btn" onClick={handleAccept}>Confirm Booking</button>
      </div>
    </div>
  );
}

export default BookingSuggestion;
