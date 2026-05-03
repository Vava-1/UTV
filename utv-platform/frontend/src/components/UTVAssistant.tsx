import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UTVLogo } from './UTVLogo';
import { MessageCircle, X, Send, Bot, User, Volume2, Brain, Activity, Settings } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: Date;
  category?: 'general' | 'support' | 'platform' | 'realtime';
}

interface LearningData {
  userPreferences: Record<string, any>;
  conversationHistory: ChatMessage[];
  platformMetrics: {
    activeUsers: number;
    totalContent: number;
    recentActivity: string[];
  };
  learnedResponses: Record<string, string>;
}

export function UTVAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      message: "Hello! I'm your enhanced UTV Assistant. I can help you discover classical and gospel music, provide real-time platform information, and assist with platform management. I learn from our conversations to serve you better. How can I assist you today?",
      category: 'general'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [learningData, setLearningData] = useState<LearningData>({
    userPreferences: {},
    conversationHistory: [],
    platformMetrics: {
      activeUsers: 1247,
      totalContent: 3842,
      recentActivity: [
        'New classical piece added: "Symphony of Hope"',
        'Gospel concert scheduled for next week',
        '500 new users joined this week'
      ]
    },
    learnedResponses: {}
  });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    setInput('');
    const userMsg = { role: 'user' as const, message: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setIsLearning(true);

    // Learning: Update conversation history and preferences
    setLearningData(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, userMsg],
      userPreferences: {
        ...prev.userPreferences,
        lastTopic: detectTopic(userMessage),
        interactionCount: (prev.userPreferences.interactionCount || 0) + 1
      }
    }));

    // Enhanced AI response with learning and real-time info
    setTimeout(() => {
      const topic = detectTopic(userMessage);
      let response: string;
      let category: 'general' | 'support' | 'platform' | 'realtime' = 'general';

      if (topic === 'platform_stats' || topic === 'realtime') {
        response = generateRealtimeResponse();
        category = 'realtime';
      } else if (topic === 'support') {
        response = generateSupportResponse(userMessage);
        category = 'support';
      } else if (topic === 'platform_control') {
        response = generatePlatformControlResponse(userMessage);
        category = 'platform';
      } else {
        response = generateEnhancedResponse(userMessage, topic);
        category = 'general';
      }

      const assistantMessage = { 
        role: 'assistant' as const, 
        message: response,
        timestamp: new Date(),
        category
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      setIsLearning(false);
      
      // Learn from this interaction
      setLearningData(prev => ({
        ...prev,
        learnedResponses: {
          ...prev.learnedResponses,
          [userMessage.toLowerCase()]: response
        }
      }));
      
      // Auto-speak the response
      setTimeout(() => speakText(response), 500);
    }, 1500);
  };

  const detectTopic = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('stats') || lowerMessage.includes('users') || lowerMessage.includes('real-time')) return 'platform_stats';
    if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('problem')) return 'support';
    if (lowerMessage.includes('control') || lowerMessage.includes('manage') || lowerMessage.includes('admin')) return 'platform_control';
    if (lowerMessage.includes('concert') || lowerMessage.includes('event')) return 'events';
    if (lowerMessage.includes('music') || lowerMessage.includes('song')) return 'music';
    if (lowerMessage.includes('artist') || lowerMessage.includes('performer')) return 'artists';
    return 'general';
  };

  const generateRealtimeResponse = (): string => {
    const metrics = learningData.platformMetrics;
    return `📊 **Platform Real-time Information:**
• Active Users: ${metrics.activeUsers.toLocaleString()}
• Total Content: ${metrics.totalContent.toLocaleString()} pieces
• Recent Activity: ${metrics.recentActivity.slice(0, 2).join(' | ')}
• Platform Status: 🟢 All systems operational

The platform is performing excellently with growing engagement. Would you like more detailed metrics or specific information about any area?`;
  };

  const generateSupportResponse = (userMessage: string): string => {
    return `🎧 **Support Team Ready to Help!**
I understand you need assistance. Our support team is available 24/7. Here are your options:

1. **Live Chat**: Connect with our support team instantly
2. **Email**: support@unatantumvoce.com
3. **Phone**: +250 788 123 456
4. **Help Center**: Browse our comprehensive FAQ

For immediate assistance with your specific issue, I can connect you to a live support agent. Would you like me to do that now?`;
  };

  const generatePlatformControlResponse = (userMessage: string): string => {
    return `⚙️ **Platform Management Features:**
As an enhanced assistant, I can help you with:

• **Content Management**: Add/remove music, books, videos
• **User Analytics**: View user engagement and statistics  
• **Event Management**: Schedule and manage concerts/events
• **Support Oversight**: Monitor support tickets and responses
• **Platform Health**: Check system status and performance

What specific platform management task would you like assistance with? I can provide real-time data and help streamline operations.`;
  };

  const generateEnhancedResponse = (userMessage: string, topic: string): string => {
    const learnedResponse = learningData.learnedResponses[userMessage.toLowerCase()];
    if (learnedResponse) {
      return `💭 **Based on our previous conversation:** ${learnedResponse}`;
    }

    const responses = {
      music: "🎵 I can help you discover our curated collection of classical and gospel music! We have pieces that inspire and educate. What genre or mood are you looking for today?",
      events: "🎭 Our concert schedule features inspiring performances! We have classical concerts, gospel evenings, and educational events. Would you like to see upcoming events or learn about our music programs?",
      artists: "🎤 We feature talented artists who create meaningful music. Our artists specialize in both classical masterpieces and uplifting gospel music. Are you looking for specific artists or new discoveries?",
      general: "🌟 I'm here to help you explore UTV's world of inspirational music and education! I can provide real-time platform information, assist with support, or help you discover our content. What would you like to explore?"
    };

    return responses[topic as keyof typeof responses] || responses.general;
  };

  const exampleQuestions = [
    "Show me platform statistics",
    "I need support with my account",
    "What's new on the platform?",
    "How can I manage content?",
    "Tell me about upcoming concerts",
    "What educational programs do you offer?"
  ];

  return (
    <>
      {/* Chat button - Professional Design */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-amber-500 hover:bg-amber-400 rounded-full shadow-2xl flex items-center justify-center text-[#09090b] transition-all duration-300 group"
      >
        {isLearning && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse">
            <Brain size={12} className="text-white" />
          </div>
        )}
        {isOpen ? <X size={20} className="sm:size-24" /> : <MessageCircle size={20} className="sm:size-24" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 left-4 sm:left-auto w-full sm:w-96 h-[500px] sm:h-[600px] max-w-md bg-[#111109] border border-[#1e1a12] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111109] border-b border-[#1e1a12] p-4 flex items-center gap-3">
              <UTVLogo size="small" className="text-amber-500" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">UTV Assistant</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-sm">Online 24/7</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#6a6055] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-[#09090b]" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-[#09090b]'
                        : 'bg-[#111109] text-[#c8c0b0] border border-[#1e1a12]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.message)}
                        className="mt-2 flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <Volume2 size={12} />
                        {isSpeaking ? 'Stop' : 'Speak'}
                      </button>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-[#1e1a12] rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-[#9a9080]" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-[#09090b]" />
                  </div>
                  <div className="bg-[#111109] border border-[#1e1a12] px-4 py-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={endRef} />
            </div>

            {/* Example questions */}
            {messages.length === 1 && (
              <div className="px-4 py-3 border-t border-[#1e1a12]">
                <p className="text-xs text-[#6a6055] mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="text-xs px-3 py-1.5 bg-[#111109] border border-[#1e1a12] rounded-full text-[#9a9080] hover:text-white hover:border-[#2a2515] transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[#1e1a12] bg-[#111109]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything about classical and gospel music..."
                  className="flex-1 bg-[#09090b] border border-[#1e1a12] rounded-lg px-4 py-2 text-sm text-white placeholder-[#6a6055] focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send size={16} className="text-[#09090b]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
