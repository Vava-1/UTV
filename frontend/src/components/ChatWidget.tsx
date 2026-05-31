import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MessageCircle, X, Send, Bot, User, AlertCircle } from "lucide-react";
import api from "@/utils/api";
import { ChatMessage } from "@/types";

export function ChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", message: t("chat.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", message: msg }]);
    setIsLoading(true);

    try {
      const res = await api.post("/chat/ask", {
        message: msg,
        session_id: sessionId || undefined,
      });
      setSessionId(res.data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: res.data.response,
          sources: res.data.sources,
        },
      ]);
    } catch (err: any) {
      // Show a contextual error instead of a generic message
      const status = err?.response?.status;
      let errorMsg = "Something went wrong. Please try again.";
      if (status === 401 || status === 403) {
        errorMsg = "You need to be signed in to use the assistant.";
      } else if (status === 429) {
        errorMsg = "Too many messages. Please wait a moment and try again.";
      } else if (!err?.response) {
        errorMsg = "Cannot reach the server. Please check your connection.";
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: errorMsg },
      ]);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-5 z-[60] w-13 h-13 bg-amber-500 hover:bg-amber-400 rounded-sm shadow-lg flex items-center justify-center text-[#09090b] transition-colors"
        style={{ width: 52, height: 52 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[104px] right-5 z-[60] flex flex-col overflow-hidden"
            style={{
              width: 360,
              maxHeight: 520,
              background: "#09090b",
              border: "0.5px solid #2a2515",
              borderRadius: 4,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: "#1e1a12", background: "#0f0e0c" }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0 bg-amber-500 rounded-sm"
                style={{ width: 32, height: 32 }}
              >
                <Bot size={16} className="text-[#09090b]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-white tracking-wide">
                  {t("chat.title")}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[10px] text-emerald-400 tracking-wide">
                    Online 24/7
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#4a3a1a] hover:text-[#9a9080] transition-colors p-1"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ minHeight: 280, maxHeight: 360 }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 rounded-sm flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-amber-500/20"
                        : "bg-[#1a1813] border border-[#2a2515]"
                    }`}
                    style={{ width: 26, height: 26 }}
                  >
                    {msg.role === "user" ? (
                      <User size={13} className="text-amber-500" />
                    ) : (
                      <Bot size={13} className="text-[#6a6055]" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[78%] px-3 py-2.5 text-[12px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-amber-500 text-[#09090b] font-medium"
                        : "text-[#c8c0b0] border border-[#2a2515]"
                    }`}
                    style={{
                      borderRadius:
                        msg.role === "user"
                          ? "12px 3px 12px 12px"
                          : "3px 12px 12px 12px",
                      background:
                        msg.role === "assistant" ? "#111109" : undefined,
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#2a2515] flex flex-wrap gap-1">
                        {msg.sources.map((s: string, si: number) => (
                          <span
                            key={si}
                            className="text-[10px] text-amber-500/60 bg-amber-500/8 px-1.5 py-0.5 rounded-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2 items-end">
                  <div
                    className="flex-shrink-0 rounded-sm flex items-center justify-center bg-[#1a1813] border border-[#2a2515]"
                    style={{ width: 26, height: 26 }}
                  >
                    <Bot size={13} className="text-[#6a6055]" />
                  </div>
                  <div
                    className="px-3 py-2.5 border border-[#2a2515]"
                    style={{
                      borderRadius: "3px 12px 12px 12px",
                      background: "#111109",
                    }}
                  >
                    <div className="flex gap-1 items-center">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-amber-500/40 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div
              className="p-3 border-t flex-shrink-0"
              style={{ borderColor: "#1e1a12", background: "#0f0e0c" }}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 text-[12px] text-[#c8c0b0] placeholder-[#4a3a1a] outline-none px-3 py-2"
                  style={{
                    background: "#111109",
                    border: "0.5px solid #2a2515",
                    borderRadius: 4,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-sm flex-shrink-0"
                  style={{ width: 36, height: 36 }}
                >
                  <Send size={14} className="text-[#09090b]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
