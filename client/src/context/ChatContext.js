import React, { createContext, useState, useEffect, useContext } from 'react';
import socketService from '../Services/socketService';
import axios from 'axios';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    // Try to get user from localStorage on mount
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);
  
  const fetchUserConversations = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/chats/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = async (conversationId, vehicleId) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      setMessages([]);
      
      const token = localStorage.getItem('token');
      
      // Attempt to fetch the conversation
      try {
        const response = await axios.get(`http://localhost:5001/api/chats/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const conversation = response.data;
        setActiveConversation(conversation);
        
        if (conversation.messages) {
          setMessages(conversation.messages);
        }
      } catch (err) {
        // If conversation doesn't exist and we have a vehicleId, create it
        if (err.response?.status === 404 && vehicleId && vehicleId !== 'new') {
          const newConversationId = await createNewConversation(vehicleId);
          conversationId = newConversationId;
        } else {
          throw err;
        }
      }
      
      // Connect to socket 
      socketService.connect();
      // Join the conversation room
      socketService.joinConversation(
        conversationId, 
        currentUser.id, 
        currentUser.role === 'owner' ? 'owner' : 'renter'
      );
      
      // Listen for new messages
      socketService.onReceiveMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
      
      // Listen for AI suggestions
      socketService.onAiSuggestion((suggestion) => {
        setAiSuggestion(suggestion);
      });
      
      // Listen for booking creation events
      socketService.onBookingCreated((bookingData) => {
        // Add as a system message
        setMessages(prev => [
          ...prev, 
          {
            type: 'system',
            text: bookingData.message,
            bookingId: bookingData.bookingId,
            timestamp: new Date()
          }
        ]);
        setAiSuggestion(null);
      });
      
      return conversationId;
      
    } catch (err) {
      console.error('Error joining conversation:', err);
      setError('Failed to join conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (vehicleId) => {
    if (!currentUser) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/chats', 
        { vehicleId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const newConversation = response.data;
      setActiveConversation(newConversation);
      setMessages([]);
      
      // Connect and join the new conversation
      socketService.connect();
      socketService.joinConversation(
        newConversation._id,
        currentUser.id,
        currentUser.role === 'owner' ? 'owner' : 'renter'
      );
      
      // Set up listeners
      socketService.onReceiveMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
      
      socketService.onAiSuggestion((suggestion) => {
        setAiSuggestion(suggestion);
      });
      
      return newConversation._id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (text) => {
    if (!activeConversation || !currentUser || !text.trim()) return;
    
    const messageData = {
      conversationId: activeConversation._id,
      vehicleId: activeConversation.vehicle,
      message: {
        text: text,
        type: 'text'
      },
      sender: {
        userId: currentUser.id,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        userType: currentUser.role === 'owner' ? 'owner' : 'renter'
      }
    };
    
    // Add message to local state immediately (optimistic update)
    const tempMessage = {
      ...messageData.message,
      sender: messageData.sender,
      timestamp: new Date(),
      _id: Date.now().toString(), // Temporary ID
      pending: true // Flag to show sending state
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Send via socket
    socketService.sendMessage(messageData);
  };

  const initiateBooking = (bookingDetails) => {
    if (!activeConversation || !currentUser) return;
    
    socketService.initiateBooking(activeConversation._id, {
      ...bookingDetails,
      vehicleId: activeConversation.vehicle,
      userId: currentUser.id
    });
  };

  const dismissSuggestion = () => {
    setAiSuggestion(null);
  };

  const leaveActiveConversation = () => {
    socketService.offEvent('receive_message');
    socketService.offEvent('ai_suggestion');
    socketService.offEvent('booking_created');
    setActiveConversation(null);
    setMessages([]);
    setAiSuggestion(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    activeConversation,
    messages,
    conversations,
    loading,
    error,
    aiSuggestion,
    fetchUserConversations,
    joinConversation,
    createNewConversation,
    sendMessage,
    initiateBooking,
    dismissSuggestion,
    leaveActiveConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
