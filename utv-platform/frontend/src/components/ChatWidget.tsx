import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import api from '@/utils/api';
import { ChatMessage } from '@/types';

export function ChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', message: t('chat.greeting') }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', message: msg }]);
    setIsLoading(true);
    try {
      const res = await api.post('/chat/ask', { message: msg, session_id: sessionId || undefined });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', message: res.data.response, sources: res.data.sources }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setIsLoading(false); }
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-[60] w-14 h-14 bg-amber-500 hover:bg-amber-400 rounded-full shadow-2xl flex items-center justify-center text-slate-900">
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-6 z-[60] w-96 max-h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center"><Bot size={18} className="text-amber-500" /></div>
              <div><h3 className="text-sm font-semibold text-white">{t('chat.title')}</h3><p className="text-[10px] text-emerald-400">Online 24/7</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[350px]">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                    {msg.role === 'user' ? <User size={14} className="text-amber-500" /> : <Bot size={14} className="text-slate-400" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-200'}`}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-2"><div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center"><Bot size={14} className="text-slate-400" /></div>
                  <div className="bg-slate-800 px-3 py-2 rounded-xl"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} /></div></div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-slate-700 bg-slate-800/50">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder={t('chat.placeholder')} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg flex items-center justify-center text-slate-900"><Send size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
