import { io } from 'socket.io-client';

const SOCKET_SERVER = 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER);
      
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Connected to socket server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Disconnected from socket server');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinConversation(conversationId, userId, userType) {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId, userId, userType });
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  initiateBooking(conversationId, bookingDetails) {
    if (this.socket) {
      this.socket.emit('initiate_booking', { conversationId, bookingDetails });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onAiSuggestion(callback) {
    if (this.socket) {
      this.socket.on('ai_suggestion', callback);
    }
  }

  onBookingCreated(callback) {
    if (this.socket) {
      this.socket.on('booking_created', callback);
    }
  }

  offEvent(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Export as singleton
const socketService = new SocketService();
export default socketService;