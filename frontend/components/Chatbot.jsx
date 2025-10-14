import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../utils/axiosClient";
import "../css/Chat.css";
import { useTranslation } from "react-i18next";

export default function Chatbot({ onTodosUpdate }) {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);

  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const pollingRef = useRef(null);

  // ---------------------------
  // SCROLL CONTROL
  // ---------------------------
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // ---------------------------
  // FETCH SESSION + MESSAGES
  // ---------------------------
  const fetchChat = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const session = await API.auth.checkSession();
      if (!session?.user) {
        setSessionUser(null);
        setMessages([{ sender: "bot", text: t("chatbot.loginPrompt", "Please log in first.") }]);
        return;
      }
      setSessionUser(session.user);

      const res = await API.get("/api/chatbot");
      const fetchedMessages =
        Array.isArray(res?.messages) && res.messages.length
          ? res.messages
          : [{ sender: "bot", text: t("chatbot.empty", "No messages yet.") }];
      setMessages(fetchedMessages);

      if (onTodosUpdate && res?.todos?.data) onTodosUpdate(res.todos.data);
    } catch (err) {
      console.error("Chat fetch error:", err);
      // Keep existing messages if we already have them
      if (messages.length === 0) {
        setMessages([{ sender: "bot", text: t("chatbot.connectionError", "Cannot connect to server. Please try again.") }]);
      }
      setError(t("chatbot.retryPrompt", "Connection issue. Click to retry."));
    } finally {
      setFetching(false);
    }
  }, [onTodosUpdate, t, messages.length]);

  // ---------------------------
  // INITIAL LOAD + LANGUAGE WATCH (FORCE GREETING UPDATE)
  // ---------------------------
  useEffect(() => {
    const refreshSession = async () => {
      try {
        // When language changes, call the same endpoint to trigger backend greeting sync
        const res = await API.get("/api/chatbot");
        const fetchedMessages =
          Array.isArray(res?.messages) && res.messages.length
            ? res.messages
            : [{ sender: "bot", text: t("chatbot.empty", "No messages yet.") }];
        setMessages(fetchedMessages);

        if (onTodosUpdate && res?.todos?.data) onTodosUpdate(res.todos.data);
      } catch (err) {
        console.error("Chat refresh error:", err);
        if (messages.length === 0) {
          setMessages([{ sender: "bot", text: t("chatbot.connectionError", "Cannot connect to server. Please try again.") }]);
        }
        setError(t("chatbot.retryPrompt", "Connection issue. Click to retry."));
      } finally {
        setFetching(false);
      }
    };

    refreshSession();
  }, [i18n.language]);

  // ---------------------------
  // POLLING SYNC (AUTO REFRESH)
  // ---------------------------
  useEffect(() => {
    if (!sessionUser) return;
    
    // Initial delay before starting polling to ensure backend is ready
    const startPollingTimeout = setTimeout(() => {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await API.get("/api/chatbot/sync", { 
            timeout: 5000 // Short timeout for sync requests
          });
          
          if (res?.messages?.length) {
            setMessages((prev) => {
              // Only update if there are actual changes
              const newMsgs = res.messages.filter(
                (m, i) => JSON.stringify(m) !== JSON.stringify(prev[i])
              );
              return newMsgs.length ? res.messages : prev;
            });
          }
        } catch (err) {
          // Silently handle sync errors - don't disrupt the user experience
          console.log("Sync temporarily unavailable, will retry later");
        }
      }, 30000); // Reduced polling frequency to every 30s to reduce server load
    }, 5000); // 5 second initial delay
    
    return () => {
      clearTimeout(startPollingTimeout);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sessionUser]);

  // ---------------------------
  // MESSAGE SENDER
  // ---------------------------
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const userMessage = { sender: "user", text: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);
    setError(null);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Number of retries for sending messages
    let retries = 2;
    let success = false;

    while (retries >= 0 && !success) {
      try {
        const res = await API.post(
          "/api/chatbot",
          { message: userText },
          { 
            signal: abortRef.current.signal,
            timeout: 60000 // 60 second timeout for this specific request
          }
        );

        // simulate natural typing delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (res?.messages?.length) {
          setMessages(res.messages);
          if (onTodosUpdate && res?.todos?.data) onTodosUpdate(res.todos.data);
          success = true;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          break; // User aborted, don't retry
        }
        
        console.error(`Send message error (retries left: ${retries}):`, err);
        retries--;
        
        if (retries < 0) {
          // All retries failed
          const fallback = t("chatbot.sendError", "Sorry, I couldn't process that message. Please try again.");
          setMessages((prev) => [...prev, { sender: "bot", text: fallback }]);
          setError(t("chatbot.retryMessage", "Message failed. Click here to try again."));
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setLoading(false);
    setTyping(false);
  }, [input, loading, onTodosUpdate, t]);

  // ---------------------------
  // ENTER KEY HANDLER
  // ---------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  // ---------------------------
  // CLEANUP ON UNMOUNT
  // ---------------------------
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ---------------------------
  // RENDER
  // ---------------------------
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

        {typing && (
          <div className="chat-message bot typing">
            {t("chatbot.typing", "Bot is typing...")}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chatbot-error" onClick={fetchChat}>
          {error} <span className="retry-button">↻</span>
        </div>
      )}

      <div className="chatbot-input-area">
        <input
          type="text"
          placeholder={t("chatbot.inputPlaceholder", "Type a message...")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || fetching}
        />
        <button onClick={handleSend} disabled={loading || fetching || !input.trim()}>
          {loading ? "..." : t("chatbot.sendButton", "Send")}
        </button>
      </div>
    </div>
  );
}
