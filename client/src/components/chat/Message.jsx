import React from 'react';
import './Message.css';

function Message({ message, isOutgoing }) {
  if (!message) return null;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle system messages (like booking confirmations)
  if (message.type === 'system') {
    return (
      <div className="message system">
        <div className="message-content">
          <p>{message.text}</p>
          {message.bookingId && (
            <a href={`/my-bookings`} className="booking-link">
              View Booking Details
            </a>
          )}
        </div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    );
  }

  return (
    <div className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      {!isOutgoing && message.sender?.name && (
        <div className="sender-name">{message.sender.name}</div>
      )}
      <div className="message-content">
        <p>{message.text}</p>
      </div>
      <div className="message-time">{formatTime(message.timestamp)}</div>
    </div>
  );
}

export default Message;