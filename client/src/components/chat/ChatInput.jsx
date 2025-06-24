import React, { useState } from 'react';
import './ChatInput.css';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        autoFocus
      />
      <button type="submit" disabled={!message.trim()}>
        <i className="bi bi-send"></i>
      </button>
    </form>
  );
}

export default ChatInput;
