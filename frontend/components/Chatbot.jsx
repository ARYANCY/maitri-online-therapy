import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../utils/axiosClient";
import "../css/Chat.css";
import { useTranslation } from "react-i18next";

export default function Chatbot({ onTodosUpdate }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const session = await API.auth.checkSession();
      if (!session.user) {
        setMessages([{ sender: "bot", text: t("chatbot.loginPrompt", "Please log in first.") }]);
        return;
      }

      const res = await API.get("/api/chatbot");
      setMessages(res.messages || []);
      if (onTodosUpdate) onTodosUpdate(res.todos || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setError(t("chatbot.connectionError", "Cannot connect to server."));
      setMessages([{ sender: "bot", text: t("chatbot.connectionError", "Cannot connect to server.") }]);
    } finally {
      setFetching(false);
    }
  }, [onTodosUpdate, t]);

  const fetchMessagesRef = useRef(fetchMessages);

  // Initial fetch + refresh on language change
  useEffect(() => {
    fetchMessagesRef.current();

    const handleLanguageChange = () => {
      fetchMessagesRef.current();
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  // Debounced send function
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    const userMessage = { sender: "user", text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);
    setError(null);

    try {
      const res = await API.post("/api/chatbot", { message: messageText });
      if (res?.messages) setMessages(res.messages);
      if (onTodosUpdate) onTodosUpdate(res.todos || []);
    } catch (err) {
      console.error("Send message error:", err);
      setError(t("chatbot.sendError", "Sorry, I couldn't process that message."));
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: t("chatbot.sendError", "Sorry, I couldn't process that message.") },
      ]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }, [input, onTodosUpdate, t]);

  // Handle Enter key
  const handleKeyPress = e => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {fetching ? (
          <div className="chatbot-loading">{t("chatbot.loading", "Loading...")}</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.sender}`}>
              <span>{msg.text}</span>
            </div>
          ))
        )}
        {typing && <div className="chat-message bot typing">{t("chatbot.typing", "Bot is typing...")}</div>}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="chatbot-error">{error}</div>}

      <div className="chatbot-input-area">
        <input
          type="text"
          value={input}
          placeholder={t("chatbot.inputPlaceholder", "Type a message...")}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading || fetching}
        />
        <button onClick={handleSend} disabled={loading || fetching || !input.trim()}>
          {loading ? "..." : t("chatbot.sendButton", "Send")}
        </button>
      </div>
    </div>
  );
}
