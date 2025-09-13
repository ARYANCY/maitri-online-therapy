import React, { useState, useEffect, useRef } from "react";
import API from "../utils/axiosClient";
import "../css/Chat.css";

export default function Chatbot({ onTodosUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // Fetch chatbot messages and todos
  const fetchMessages = async () => {
    try {
      const session = await API.auth.checkSession();
      if (!session.user) {
        setMessages([{ sender: "bot", text: "Please log in first." }]);
        return;
      }

      const res = await API.get("/api/chatbot");
      setMessages(res.messages || []);
      if (onTodosUpdate) onTodosUpdate(res.todos || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([{ sender: "bot", text: "Cannot connect to server." }]);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Send user message to chatbot
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/api/chatbot", { message: input });
      setMessages(res.messages || []);
      if (onTodosUpdate) onTodosUpdate(res.todos || []);
    } catch (err) {
      console.error("Send message error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't process that message." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
