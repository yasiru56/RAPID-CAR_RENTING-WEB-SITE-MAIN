import React from 'react';
import Message from './Message';
import './MessageList.css';

function MessageList({ messages, currentUserId }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="empty-messages">
          <i className="bi bi-chat-dots"></i>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <Message 
          key={message._id || index}
          message={message}
          isOutgoing={message.sender?.userId === currentUserId}
        />
      ))}
    </div>
  );
}

export default MessageList;