import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';
import ChatBox from '../../components/chat/ChatBox';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import BookingSuggestion from '../../components/chat/BookingSuggestion';
import './ChatRoom.css';

function ChatRoom() {
  const { conversationId, vehicleId } = useParams();
  const navigate = useNavigate();
  const { 
    currentUser, 
    activeConversation, 
    messages, 
    loading, 
    error,
    aiSuggestion,
    joinConversation, 
    leaveActiveConversation,
    sendMessage,
    initiateBooking,
    dismissSuggestion
  } = useChatContext();
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if the user is logged in
    if (!currentUser) {
      navigate('/user/login', { state: { from: `/chat/${vehicleId}/${conversationId}` } });
      return;
    }
    
    // Join conversation when component mounts
    joinConversation(conversationId, vehicleId);
    
    // Leave conversation when component unmounts
    return () => {
      leaveActiveConversation();
    };
  }, [conversationId, vehicleId, currentUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (messageText) => {
    sendMessage(messageText);
  };

  const handleBookingAccept = (dates) => {
    initiateBooking({
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Connecting to chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        
        {activeConversation && activeConversation.vehicle && (
          <div className="chat-title">
            <h2>Chat about {activeConversation.vehicleDetails?.name || 'Vehicle'}</h2>
          </div>
        )}
      </div>
      
      <ChatBox>
        <MessageList 
          messages={messages} 
          currentUserId={currentUser?.id} 
        />
        
        {aiSuggestion && (
          <BookingSuggestion
            suggestion={aiSuggestion}
            onAccept={handleBookingAccept}
            onDismiss={dismissSuggestion}
          />
        )}
        
        <ChatInput onSendMessage={handleSendMessage} />
        <div ref={messagesEndRef} />
      </ChatBox>
    </div>
  );
}

export default ChatRoom;