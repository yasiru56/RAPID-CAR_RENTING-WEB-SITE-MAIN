const { NlpManager } = require('node-nlp');

class ConversationAnalyzer {
  constructor() {
    this.manager = new NlpManager({ languages: ['en'] });
    this.initializeModel();
  }
  
  async initializeModel() {
    // Train for detecting agreement/booking intent
    this.manager.addDocument('en', 'That sounds good to me', 'booking_intent');
    this.manager.addDocument('en', 'I want to book this car', 'booking_intent');
    this.manager.addDocument('en', 'Let\'s finalize this deal', 'booking_intent');
    this.manager.addDocument('en', 'I agree with the price', 'booking_intent');
    this.manager.addDocument('en', 'Can we book it for this weekend', 'booking_intent');
    this.manager.addDocument('en', 'I would like to rent this vehicle', 'booking_intent');
    this.manager.addDocument('en', 'That works for me', 'booking_intent');
    this.manager.addDocument('en', 'deal', 'booking_intent');
    this.manager.addDocument('en', 'done', 'booking_intent');
    this.manager.addDocument('en', 'great, I\'ll take it', 'booking_intent');
    this.manager.addDocument('en', 'can I confirm this booking', 'booking_intent');
    this.manager.addDocument('en', 'when can I pick up the car', 'booking_intent');
    this.manager.addDocument('en', 'how do I pay for the rental', 'booking_intent');
    this.manager.addDocument('en', 'I\'m ready to book', 'booking_intent');
    this.manager.addDocument('en', 'let\'s proceed with booking', 'booking_intent');
    
    // Train for non-booking conversations
    this.manager.addDocument('en', 'How many seats does it have', 'general_inquiry');
    this.manager.addDocument('en', 'What\'s the fuel efficiency', 'general_inquiry');
    this.manager.addDocument('en', 'Can you tell me more about it', 'general_inquiry');
    this.manager.addDocument('en', 'Is there air conditioning', 'general_inquiry');
    this.manager.addDocument('en', 'Does it have GPS', 'general_inquiry');
    this.manager.addDocument('en', 'What color is the car', 'general_inquiry');
    this.manager.addDocument('en', 'Is it manual or automatic', 'general_inquiry');
    
    // Train for availability questions (not yet booking intent)
    this.manager.addDocument('en', 'Is the car available next weekend', 'availability');
    this.manager.addDocument('en', 'Are you free on Friday', 'availability');
    this.manager.addDocument('en', 'Do you have availability on these dates', 'availability');
    this.manager.addDocument('en', 'Is it available for the 15th', 'availability');
    this.manager.addDocument('en', 'Can I rent it next month', 'availability');
    
    // Train for price negotiation (potential booking intent)
    this.manager.addDocument('en', 'Can you lower the price', 'negotiation');
    this.manager.addDocument('en', 'That\'s a bit expensive', 'negotiation');
    this.manager.addDocument('en', 'Would you consider a discount', 'negotiation');
    this.manager.addDocument('en', 'How about a lower rate for longer rental', 'negotiation');
    
    // Train the model
    await this.manager.train();
    console.log('NLP model trained successfully');
  }
  
  extractDates(text) {
    // Date patterns to match:
    // - MM/DD/YYYY or DD/MM/YYYY (e.g., 04/25/2023)
    // - MM-DD-YYYY or DD-MM-YYYY (e.g., 04-25-2023)
    // - Month Day (e.g., April 25, April 25th)
    // - Day of week (e.g., Monday, Tuesday)
    // - Next/this + timeframe (e.g., next weekend, this Friday)
    
    const patterns = [
      // MM/DD/YYYY or DD/MM/YYYY
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      
      // MM-DD-YYYY or DD-MM-YYYY
      /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
      
      // Month Day or Month Day, Year
      /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?\b/gi,
      
      // Day of week
      /\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\b/gi,
      
      // Next/this + timeframe
      /\b(?:next|this)\s+(?:weekend|week|month|(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))\b/gi,
      
      // tomorrow, day after tomorrow, tonight
      /\b(?:tomorrow|day after tomorrow|tonight)\b/gi
    ];
    
    let allMatches = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      allMatches = [...allMatches, ...matches];
    });
    
    return [...new Set(allMatches)]; // Remove duplicates
  }
  
  async analyzeConversation(messages) {
    if (!messages || messages.length === 0) {
      return {
        intent: 'unknown',
        score: 0,
        suggestedDates: [],
        isBookingIntent: false
      };
    }
    
    // Combine the last few messages for context
    const recentMessages = messages.slice(-5); // Consider the last 5 messages
    const combinedText = recentMessages.map(m => m.text || '').join(' ');
    
    // Process with NLP
    const result = await this.manager.process('en', combinedText);
    
    // Extract potential dates
    const suggestedDates = this.extractDates(combinedText);
    
    // Check for booking trigger words directly (as backup)
    const bookingKeywords = ['book', 'rent', 'reserve', 'deal', 'done', 'confirm', 'agree', 'take it'];
    const containsBookingKeywords = bookingKeywords.some(keyword => 
      combinedText.toLowerCase().includes(keyword)
    );
    
    // Determine if this is a booking intent
    // We consider it booking intent if:
    // 1. The NLP model says it's 'booking_intent' with good confidence, OR
    // 2. We find booking keywords and dates in the conversation
    const isBookingIntent = 
      (result.intent === 'booking_intent' && result.score > 0.65) || 
      (containsBookingKeywords && suggestedDates.length > 0);
    
    return {
      intent: isBookingIntent ? 'booking_intent' : result.intent,
      score: result.score,
      suggestedDates,
      isBookingIntent,
      entities: result.entities || [],
      containsBookingKeywords
    };
  }
}

module.exports = ConversationAnalyzer;