import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UTVLogo } from './UTVLogo';
import { MessageCircle, X, Send, Bot, User, Volume2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: Date;
}

export function UTVAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      message: "Hello! I'm your UTV Assistant. I can help you discover classical and gospel music, find information about artists, concerts, and more. How can I assist you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
    setMessages(prev => [...prev, { role: 'user', message: userMessage, timestamp: new Date() }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you explore our classical and gospel music collection! What specific type of music are you interested in?",
        "UTV Classical-Gospel offers a unique blend of inspirational music. Would you like to discover new artists or browse our concert schedule?",
        "Our platform features educational and spiritual content through music. Are you looking for something uplifting or contemplative?",
        "We have a wonderful collection of both classical masterpieces and gospel favorites. What mood are you looking for today?",
        "Our music is designed to inspire and educate. Would you like recommendations based on your preferences?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const assistantMessage = { 
        role: 'assistant' as const, 
        message: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Auto-speak the response
      setTimeout(() => speakText(randomResponse), 500);
    }, 1500);
  };

  const exampleQuestions = [
    "What type of music do you have?",
    "How do I find classical concerts?",
    "Tell me about gospel music",
    "What educational content do you offer?"
  ];

  return (
    <>
      {/* Chat button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-amber-500 hover:bg-amber-400 rounded-full shadow-2xl flex items-center justify-center text-[#09090b] transition-all"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-32 right-8 z-50 w-96 h-[600px] bg-[#09090b] border border-[#1e1a12] rounded-lg shadow-2xl flex flex-col overflow-hidden"
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
