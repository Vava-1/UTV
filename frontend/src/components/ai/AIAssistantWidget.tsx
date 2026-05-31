import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Send, X, Minimize } from "lucide-react";
import { aiApi } from "@/services/ai";
import { useDebounce } from "@/hooks/useDebounce";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getSessionId(): string {
  let id = localStorage.getItem("utv_chat_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("utv_chat_session", id);
  }
  return id;
}

export function AIAssistantWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => getSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiApi.chat(text, sessionId, i18n.language);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickQuestions = [
    t("ai.quickQ1"),
    t("ai.quickQ2"),
    t("ai.quickQ3"),
    t("ai.quickQ4"),
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-utv-gold rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          style={{ boxShadow: "0 0 0 0 rgba(201,168,76,0.4)", animation: "pulse 2s infinite" }}
        >
          <Music className="w-6 h-6 text-utv-bg" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] bg-utv-bg border border-utv-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-utv-bg-light border-b border-utv-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-utv-gold flex items-center justify-center">
                  <Music className="w-4 h-4 text-utv-bg" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-utv-cream">{t("ai.title")}</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-utv-body">{t("ai.subtitle")}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-utv-body hover:text-utv-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-utv-body text-center">
                    How can I help you today?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-utv-border text-utv-body hover:bg-utv-gold/20 hover:text-utv-gold transition-colors border border-utv-border-light"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-utv-gold text-utv-bg rounded-br-none"
                        : "bg-utv-border text-utv-body rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-utv-border px-4 py-3 rounded-xl rounded-bl-none">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-utv-body rounded-full animate-typing"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-utv-border">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 bg-utv-border border border-utv-border-light rounded-lg px-3 py-2 text-sm text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-utv-gold text-utv-bg p-2 rounded-lg hover:bg-utv-gold/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
