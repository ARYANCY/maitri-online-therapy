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
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    setFetching(true);
    try {
      const session = await API.auth.checkSession();
      if (!session.user) {
        setMessages([
          { sender: "bot", text: t("chatbot.loginPrompt", "Please log in first.") },
        ]);
        setFetching(false);
        return;
      }

      const res = await API.get("/api/chatbot");
      setMessages(res.messages || []);
      if (onTodosUpdate) onTodosUpdate(res.todos || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([
        { sender: "bot", text: t("chatbot.connectionError", "Cannot connect to server.") },
      ]);
    } finally {
      setFetching(false);
    }
  }, [onTodosUpdate, t]);

  // Initial fetch + refresh on language change
  useEffect(() => {
    fetchMessages();

    const handleLanguageChange = () => fetchMessages();
    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, [fetchMessages]);

  // Send a message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/api/chatbot", { message: input.trim() });
      if (res?.messages) setMessages(res.messages);
      if (onTodosUpdate) onTodosUpdate(res.todos || []);
    } catch (err) {
      console.error("Send message error:", err);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: t("chatbot.sendError", "Sorry, I couldn't process that message."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
        <div ref={messagesEndRef} />
      </div>

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
