import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../utils/axiosClient";
import "../css/components/Chat.css";
import { useTranslation } from "react-i18next";
import { useVoskSpeechRecognition } from "../hooks/useVoskSpeechRecognition";

export default function Chatbot({ onTodosUpdate, onDataUpdate }) {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [sendProgress, setSendProgress] = useState(0);
  const [conversationProgress, setConversationProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  

  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const pollingRef = useRef(null);
  const transcriptTimeoutRef = useRef(null);
  const previousTranscriptRef = useRef("");
  const startingRef = useRef(false);
  const lastDataUpdateRef = useRef(0);
  const isSendingRef = useRef(false); 
  const progressIntervalRef = useRef(null);

  
  const {
    transcript = "",
    finalTranscript = "",
    listening = false,
    resetTranscript = () => {},
    startListening: startVoskListening,
    stopListening: stopVoskListening,
    browserSupportsSpeechRecognition = false,
    isMicrophoneAvailable = false,
    error: speechRecognitionError
  } = useVoskSpeechRecognition({
    clearTranscriptOnListen: false, 
    continuous: true,
    interimResults: true,
    language: i18n.language === 'en' ? 'en-US' : i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'as' ? 'as-IN' : 'en-US'
  });

  
  useEffect(() => {
    if (speechRecognitionError) {
      setSpeechError(speechRecognitionError);
      setError(speechRecognitionError);
    }
  }, [speechRecognitionError]);

  useEffect(() => {
    
    
    const textToShow = transcript || finalTranscript || "";
    const trimmedText = textToShow.trim();
    
    
    if (trimmedText) {
      setInput(trimmedText);
      previousTranscriptRef.current = trimmedText;
    } else if (!listening && previousTranscriptRef.current) {
      
      setInput(previousTranscriptRef.current);
    }
  }, [transcript, finalTranscript, listening]);

  
  useEffect(() => {
    if (!listening && previousTranscriptRef.current) {
      
      setIsProcessingTranscript(true);
      
      
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }

      
      
      transcriptTimeoutRef.current = setTimeout(() => {
        
        const finalText = finalTranscript.trim() || transcript.trim() || previousTranscriptRef.current.trim();
        
          if (finalText) {
            setInput(finalText);
            
        } else {
          
          if (previousTranscriptRef.current) {
            setInput(previousTranscriptRef.current);
          }
        }
        
        setIsProcessingTranscript(false);
        
      }, 1000); 
    } else if (!listening && !previousTranscriptRef.current) {
      setIsProcessingTranscript(false);
    }
  }, [listening, transcript, finalTranscript]);

  
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  
  useEffect(() => {
    return () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, []);

  
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
      
      
      const userMessages = fetchedMessages.filter(m => m.sender === "user").length;
      const progressPercent = Math.min(100, (userMessages / 10) * 100);
      setConversationProgress(progressPercent);

      if (onTodosUpdate && res?.todos?.data) onTodosUpdate(res.todos.data);
    } catch (err) {
      
      if (messages.length === 0) {
        setMessages([{ sender: "bot", text: t("chatbot.connectionError", "Cannot connect to server. Please try again.") }]);
      }
      setError(t("chatbot.retryPrompt", "Connection issue. Click to retry."));
    } finally {
      setFetching(false);
    }
  }, [onTodosUpdate, t]);

  
  
  
  useEffect(() => {
    const refreshSession = async () => {
      try {
        
        const res = await API.get("/api/chatbot");
        const fetchedMessages =
          Array.isArray(res?.messages) && res.messages.length
            ? res.messages
            : [{ sender: "bot", text: t("chatbot.empty", "No messages yet.") }];
        setMessages(fetchedMessages);
        
        
        const userMessages = fetchedMessages.filter(m => m.sender === "user").length;
        const progressPercent = Math.min(100, (userMessages / 10) * 100);
        setConversationProgress(progressPercent);

        if (onTodosUpdate && res?.todos?.data) onTodosUpdate(res.todos.data);
        
        
      } catch (err) {
        if (messages.length === 0) {
          setMessages([{ sender: "bot", text: t("chatbot.connectionError", "Cannot connect to server. Please try again.") }]);
        }
        setError(t("chatbot.retryPrompt", "Connection issue. Click to retry."));
      } finally {
        setFetching(false);
      }
    };

    refreshSession();
  }, [i18n.language, t]);

 
 
  useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".fade-slide").forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}, []);



   
  
  
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchChat();
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [fetchChat, onDataUpdate]);

  const handleSend = useCallback(async () => {
    
    if (isSendingRef.current || !input.trim() || loading) {
      return;
    }

    // Stop voice input if it's currently active
    if (listening) {
      stopVoskListening();
    }

    
    isSendingRef.current = true;
    
    const userText = input.trim();
    const userMessage = { sender: "user", text: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);
    setError(null);
    setSendProgress(0);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    
    progressIntervalRef.current = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 90) return prev; 
        return prev + Math.random() * 10;
      });
    }, 200);

    
    let retries = 2;
    let success = false;
    let lastError = null;

    try {
      while (retries >= 0 && !success) {
        try {
          setSendProgress(30);
          const res = await API.post(
            "/api/chatbot",
            { message: userText },
            { 
              signal: abortRef.current.signal,
              timeout: 60000, 
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total) + 30;
                  setSendProgress(percentCompleted);
                }
              }
            }
          );

          setSendProgress(90);
          
          await new Promise((resolve) => setTimeout(resolve, 400));

          if (res?.messages?.length) {
            setSendProgress(100);
            
            setMessages(res.messages);
            
            const userMessages = res.messages.filter(m => m.sender === "user").length;
            const progressPercent = Math.min(100, (userMessages / 10) * 100); 
            setConversationProgress(progressPercent);
            
            if (onTodosUpdate && res?.todos?.data) onTodosUpdate(res.todos.data);
            
            
            
            
            
            
            
            
            
            
            success = true;
            setTimeout(() => setSendProgress(0), 500); 
            break; 
          } else {
            throw new Error("Invalid response format");
          }
        } catch (err) {
          if (err.name === "AbortError") {
            break; 
          }
          
          lastError = err;
          retries--;
          
          if (retries < 0) {
            
            setMessages((prev) => {
              
              let lastUserMsgIdx = -1;
              for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i].sender === "user" && prev[i].text === userText) {
                  lastUserMsgIdx = i;
                  break;
                }
              }
              
              const filtered = prev.filter((msg, idx) => idx !== lastUserMsgIdx);
              return [...filtered, { sender: "bot", text: t("chatbot.sendError", "Sorry, I couldn't process that message. Please try again.") }];
            });
            setError(t("chatbot.retryMessage", "Message failed. Click here to try again."));
          } else {
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } finally {
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      isSendingRef.current = false;
      setLoading(false);
      setTyping(false);
      setTimeout(() => setSendProgress(0), 1000);
    }
  }, [input, loading, onTodosUpdate, onDataUpdate, t, listening, stopVoskListening]);

  
  
  
  const handleKeyDown = useCallback((e) => {
    
    if (e.key === "Enter" && !loading && !isSendingRef.current && input.trim()) {
      e.preventDefault(); 
      handleSend();
    }
  }, [loading, input, handleSend]);

  
  
  
  const startListening = useCallback(async () => {
    
    if (startingRef.current) {
      return;
    }

    
    if (listening) {
      return;
    }

    
    startingRef.current = true;

    
    setSpeechError(null);
    setError(null);

    
    if (!browserSupportsSpeechRecognition) {
      startingRef.current = false;
      const errorMsg = t("chatbot.speechNotSupported", "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      setSpeechError(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      
      let permissionGranted = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        stream.getTracks().forEach(track => track.stop());
        permissionGranted = true;
      } catch (permErr) {
        startingRef.current = false;
        let errorMsg = t("chatbot.microphoneNotAvailable", "Microphone is not available. Please check your permissions.");
        
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          errorMsg = t("chatbot.microphonePermissionDenied", "Microphone permission denied. Please allow microphone access in your browser settings.");
        } else if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
          errorMsg = t("chatbot.microphoneNotFound", "No microphone found. Please connect a microphone and try again.");
        }
        
        setSpeechError(errorMsg);
        setError(errorMsg);
        return;
      }

      if (!permissionGranted) {
        startingRef.current = false;
        return;
      }

      
      resetTranscript();
      setInput("");
      previousTranscriptRef.current = "";
      setIsProcessingTranscript(false);
      
      
      
      startVoskListening();
      

      
      setTimeout(() => {
        startingRef.current = false;
      }, 1000);
    } catch (err) {
      startingRef.current = false;
      const errorMsg = t("chatbot.speechError", "Failed to start speech recognition. Please try again.");
      setSpeechError(errorMsg);
      setError(errorMsg);
    }
  }, [browserSupportsSpeechRecognition, i18n.language, resetTranscript, t, listening, startVoskListening, isMicrophoneAvailable]);

  const stopListening = useCallback(() => {
    try {
      
      stopVoskListening();
      
      
      setTimeout(() => {
        const currentText = (transcript || finalTranscript || previousTranscriptRef.current || "").trim();
        
        if (currentText) {
          
          previousTranscriptRef.current = currentText;
          setInput(currentText);
        }
        
        
        
        if (currentText) {
          setIsProcessingTranscript(true);
          setTimeout(() => {
            setIsProcessingTranscript(false);
          }, 500);
        } else {
          setIsProcessingTranscript(false);
        }
      }, 300); 
      
    } catch (err) {
      setIsProcessingTranscript(false);
    }
  }, [transcript, finalTranscript, stopVoskListening]);

  const toggleListening = useCallback(() => {
    
    if (isProcessingTranscript) {
      return;
    }

    
    if (startingRef.current) {
      return;
    }

    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening, isProcessingTranscript]);

  
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }

    const handleSpeechError = (event) => {
      let errorMsg = t("chatbot.speechError", "Speech recognition error occurred.");
      
      if (event.error === 'no-speech') {
        errorMsg = t("chatbot.noSpeech", "No speech detected. Please try speaking again.");
      } else if (event.error === 'audio-capture') {
        errorMsg = t("chatbot.audioCaptureError", "No microphone found. Please check your microphone connection.");
      } else if (event.error === 'not-allowed') {
        errorMsg = t("chatbot.microphonePermissionDenied", "Microphone permission denied. Please allow microphone access.");
      } else if (event.error === 'network') {
        errorMsg = t("chatbot.networkError", "Network error. Please check your internet connection.");
      }
      
      setSpeechError(errorMsg);
      setError(errorMsg);
      setIsListening(false);
      setIsProcessingTranscript(false);
    };

    
    
    return () => {
      
    };
  }, [browserSupportsSpeechRecognition, t]);

  
  
  
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  
  
  
    const userMessageCount = messages.filter(m => m.sender === "user").length;
    const botMessageCount = messages.filter(m => m.sender === "bot").length;
    
    return (
      <div className="chatbot-container card h-100 d-flex flex-column shadow-sm">
        
        <div className="card border-warning mb-3 mx-3 mt-3" style={{borderWidth: "2px"}}>
          <div className="card-header bg-warning text-dark d-flex align-items-center gap-2">
            <div className="fs-4 fs-md-3">⚠️</div>
            <h3 className="h6 h-md-5 mb-0">Important Disclaimer</h3>
          </div>
          <div className="card-body">
            <p className="mb-0">
              <strong>⚠️ Disclaimer:</strong> This content is AI-generated. No medical diagnosis is provided. The information provided is for calculating risk factors only. For more accurate results and proper medical evaluation, please consult a qualified healthcare professional.
            </p>
          </div>
        </div>
        
        <header className="chatbot-header card-header bg-light border-bottom">
          <div className="chatbot-header-content d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 gap-md-4 w-100">
            <div className="chatbot-header-left d-flex align-items-center gap-2 gap-md-3 flex-grow-1 min-w-0">
              <div className="chatbot-logo flex-shrink-0">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                  <defs>
                    <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4ade80"/>
                      <stop offset="100%" stopColor="#059669"/>
                    </linearGradient>
                  </defs>
                  <rect x="8" y="16" width="48" height="40" rx="8" fill="url(#botGradient)"/>
                  <rect x="20" y="8" width="24" height="12" rx="4" fill="url(#botGradient)"/>
                  <circle cx="24" cy="32" r="6" fill="#fff"/>
                  <circle cx="40" cy="32" r="6" fill="#fff"/>
                  <circle cx="24" cy="32" r="3" fill="#1f2937"/>
                  <circle cx="40" cy="32" r="3" fill="#1f2937"/>
                  <path d="M24 44 C24 48, 40 48, 40 44" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <rect x="4" y="28" width="6" height="12" rx="3" fill="url(#botGradient)"/>
                  <rect x="54" y="28" width="6" height="12" rx="3" fill="url(#botGradient)"/>
                  <circle cx="32" cy="4" r="3" fill="#4ade80"/>
                  <line x1="32" y1="7" x2="32" y2="12" stroke="#4ade80" strokeWidth="2"/>
                </svg>
              </div>
              <div className="chatbot-header-text flex-grow-1 min-w-0">
                <div className="chatbot-title-wrapper d-flex align-items-center gap-2 flex-wrap">
                  <h1 className="chatbot-title h5 h-md-4 mb-0 text-truncate">{t("chatbot.title", "Maitri AI Assistant")}</h1>
                  <button
                    className="btn btn-sm btn-outline-secondary flex-shrink-0"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    aria-label={t("chatbot.refresh", "Refresh")}
                    title={t("chatbot.refresh", "Refresh")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className={isRefreshing ? 'spinning' : ''}
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                      ></path>
                      <path
                        fillRule="evenodd"
                        d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                      ></path>
                    </svg>
                  </button>
                </div>
                <p className="chatbot-subtitle mb-0 d-none d-sm-block">{t("chatbot.subtitle", "Your intelligent mental health companion")}</p>
              </div>
            </div>
            <div className="chatbot-header-stats d-flex gap-2 gap-md-3 flex-shrink-0">
              <div className="stat-item text-center">
                <div className="stat-value fw-bold">{userMessageCount}</div>
                <div className="stat-label">{t("chatbot.messages", "Messages")}</div>
              </div>
              <div className="stat-item text-center">
                <div className="stat-value fw-bold">{botMessageCount}</div>
                <div className="stat-label">{t("chatbot.replies", "Replies")}</div>
              </div>
              {conversationProgress > 0 && (
                <div className="stat-item progress-stat text-center">
                  <div className="stat-value fw-bold">{Math.round(conversationProgress)}%</div>
                  <div className="stat-label">{t("chatbot.progress", "Progress")}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        
        <section className="chatbot-messages-wrapper card-body flex-grow-1 overflow-auto p-2 p-md-3">
          <div className="chatbot-messages d-flex flex-column gap-2 gap-md-3">
            {fetching ? (
              <div className="chatbot-loading d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" style={{width: "3rem", height: "3rem"}}></div>
                <span className="loading-text">{t("chatbot.loading", "Loading...")}</span>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
                  <div className={`d-flex align-items-start gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`} style={{maxWidth: "min(75%, 600px)"}}>
                    {msg.sender === "user" ? (
                      <div className="message-avatar user-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-primary text-white" style={{width: "32px", height: "32px", minWidth: "32px"}}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                          <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="currentColor"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="message-avatar bot-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{width: "32px", height: "32px", minWidth: "32px", background: "linear-gradient(135deg, #4ade80 0%, #059669 100%)"}}>
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                          <rect x="12" y="18" width="40" height="34" rx="6" fill="#fff"/>
                          <circle cx="26" cy="32" r="4" fill="#1f2937"/>
                          <circle cx="38" cy="32" r="4" fill="#1f2937"/>
                          <path d="M26 42 C26 45, 38 45, 38 42" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                        </svg>
                      </div>
                    )}
                    <div className={`message-content rounded p-3 p-md-4 fade-slide ${msg.sender === "user" ? "message-user" : "message-bot"}`}>
                      <span className="message-text">{msg.text}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {typing && (
              <div className="d-flex justify-content-start">
                <div className="d-flex align-items-start gap-2" style={{maxWidth: "min(75%, 600px)"}}>
                  <div className="message-avatar bot-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{width: "32px", height: "32px", minWidth: "32px", background: "linear-gradient(135deg, #4ade80 0%, #059669 100%)"}}>
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <rect x="12" y="18" width="40" height="34" rx="6" fill="#fff"/>
                      <circle cx="26" cy="32" r="4" fill="#1f2937"/>
                      <circle cx="38" cy="32" r="4" fill="#1f2937"/>
                      <path d="M26 42 C26 45, 38 45, 38 42" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </div>
                  <div className="message-content message-bot rounded p-3 p-md-4 fade-slide">
                    <div className="typing-indicator-dots d-flex gap-2 mb-2">
                      <span className="typing-dot badge rounded-pill" style={{width: "10px", height: "10px", animationDelay: "0s"}}></span>
                      <span className="typing-dot badge rounded-pill" style={{width: "10px", height: "10px", animationDelay: "0.2s"}}></span>
                      <span className="typing-dot badge rounded-pill" style={{width: "10px", height: "10px", animationDelay: "0.4s"}}></span>
                    </div>
                    <span className="typing-text">{t("chatbot.typing", "Bot is typing...")}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="messages-end" />
          </div>
        </section>

        
        <section className="chatbot-input-section card-footer bg-light border-top">
          <div className="chatbot-input-area p-0">
            
            <div className={`input-group input-group-lg d-none d-md-flex chatbot-input-group ${isProcessingTranscript ? 'processing' : listening ? 'listening' : ''}`}>
              <input
                type="text"
                id="chatbot-input"
                name="chatbot-input"
                className="form-control form-control-lg chatbot-input-field"
                placeholder={
                  isProcessingTranscript 
                    ? t("chatbot.processingTranscript", "Processing your speech...")
                    : listening
                    ? t("chatbot.speakNow", "Speak now...")
                    : t("chatbot.inputPlaceholder", "Type a message...")
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || fetching || isProcessingTranscript}
                aria-label="Chat message input"
              />
              
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  className={`btn btn-outline-secondary chatbot-voice-btn ${listening ? 'active' : ''}`}
                  onClick={toggleListening}
                  disabled={loading || fetching || isProcessingTranscript}
                  title={
                    isProcessingTranscript
                      ? t("chatbot.processing", "Processing...")
                      : listening
                      ? t("chatbot.stopListening", "Stop listening")
                      : t("chatbot.startListening", "Start voice input")
                  }
                  aria-label={
                    isProcessingTranscript
                      ? t("chatbot.processing", "Processing...")
                      : listening
                      ? t("chatbot.stopListening", "Stop listening")
                      : t("chatbot.startListening", "Start voice input")
                  }
                >
                  {isProcessingTranscript ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <span className="voice-icon">🎤</span>
                  )}
                </button>
              )}

              
              <button 
                onClick={handleSend} 
                disabled={loading || fetching || !input.trim() || isProcessingTranscript}
                className="btn btn-primary chatbot-send-btn"
                aria-label="Send message"
                title={t("chatbot.sendButton", "Send")}
              >
                {loading || isProcessingTranscript ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <span className="send-icon">➤</span>
                )}
              </button>
            </div>

            
            <div className="d-flex d-md-none flex-column gap-2">
              <input
                type="text"
                id="chatbot-input-mobile"
                name="chatbot-input-mobile"
                className="form-control form-control-lg"
                placeholder={
                  isProcessingTranscript 
                    ? t("chatbot.processingTranscript", "Processing your speech...")
                    : listening
                    ? t("chatbot.speakNow", "Speak now...")
                    : t("chatbot.inputPlaceholder", "Type a message...")
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || fetching || isProcessingTranscript}
                aria-label="Chat message input"
              />
              <div className="d-flex gap-2 align-items-stretch">
                {browserSupportsSpeechRecognition && (
                  <button
                    type="button"
                    className={`btn btn-outline-secondary btn-lg flex-fill d-flex align-items-center justify-content-center ${listening ? 'active' : ''}`}
                    onClick={toggleListening}
                    disabled={loading || fetching || isProcessingTranscript}
                  >
                    {isProcessingTranscript ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <span className="d-flex align-items-center gap-1">
                        <span style={{ fontSize: "1.1rem" }}>🎤</span>
                        <span>{listening ? t("chatbot.stopListening", "Stop") : t("chatbot.startListening", "Voice")}</span>
                      </span>
                    )}
                  </button>
                )}
                <button 
                  onClick={handleSend} 
                  disabled={loading || fetching || !input.trim() || isProcessingTranscript}
                  className="btn btn-primary btn-lg flex-fill d-flex align-items-center justify-content-center"
                >
                  {loading || isProcessingTranscript ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <span className="d-flex align-items-center gap-1">
                      <span style={{ fontSize: "1.1rem" }}>➤</span>
                      <span>{t("chatbot.sendButton", "Send")}</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            
            <div className="status-indicators mt-2">
              {listening && (
                <div className="alert alert-info d-flex align-items-center gap-2 mb-2 py-2">
                  <span className="badge bg-primary rounded-pill" style={{width: "8px", height: "8px"}}></span>
                  <span className="small">{t("chatbot.listening", "Listening...")}</span>
                </div>
              )}
              {isProcessingTranscript && (
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-2 py-2">
                  <span className="spinner-border spinner-border-sm"></span>
                  <span className="small">{t("chatbot.processingTranscript", "Processing your speech...")}</span>
                </div>
              )}
              {speechError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-2 py-2">
                  <span>⚠️</span>
                  <span className="small">{speechError}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        
        {messages.length <= 1 && (
          <section className="chatbot-info-wrapper card-body p-2 p-md-3">
            <div className="chatbot-info-section">
              <div className="card mb-3 mb-md-4 shadow-sm">
                <div className="card-header bg-light d-flex align-items-center gap-2">
                  <div className="fs-4 fs-md-3">💬</div>
                  <h2 className="h6 h-md-5 mb-0">{t("chatbot.welcomeTitle", "Welcome to Maitri")}</h2>
                </div>
                <div className="card-body fade-slide">
                  <p className="mb-0">
                    {t("chatbot.description", "This assistant automatically understands your messages, analyses the context, and responds in your preferred language. Your language choice is saved in localStorage, so it stays even after closing the app.")}
                  </p>
                </div>
              </div>

              <div className="card mb-3 mb-md-4 shadow-sm">
                <div className="card-header bg-light d-flex align-items-center gap-2">
                  <div className="fs-4 fs-md-3">✨</div>
                  <h3 className="h6 h-md-5 mb-0">{t("chatbot.benefitsTitle", "Main Benefits")}</h3>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-3 d-flex align-items-start gap-2 fade-slide" style={{animationDelay: "0.1s"}}>
                      <span className="text-success flex-shrink-0 fs-5">✓</span>
                      <span>{t("chatbot.benefit1", "AI understands natural conversation and gives accurate responses.")}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start gap-2 fade-slide" style={{animationDelay: "0.2s"}}>
                      <span className="text-success flex-shrink-0 fs-5">✓</span>
                      <span>{t("chatbot.benefit2", "All text is processed to detect tasks automatically.")}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start gap-2 fade-slide" style={{animationDelay: "0.3s"}}>
                      <span className="text-success flex-shrink-0 fs-5">✓</span>
                      <span>{t("chatbot.benefit3", "Your Todo List updates dynamically based on your chats.")}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start gap-2 fade-slide" style={{animationDelay: "0.4s"}}>
                      <span className="text-success flex-shrink-0 fs-5">✓</span>
                      <span>{t("chatbot.benefit4", "Charts auto-refresh to show productivity trends.")}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start gap-2 fade-slide" style={{animationDelay: "0.5s"}}>
                      <span className="text-success flex-shrink-0 fs-5">✓</span>
                      <span>{t("chatbot.benefit5", "Smart session syncing across devices when logged in.")}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start gap-2 fade-slide" style={{animationDelay: "0.6s"}}>
                      <span className="text-success flex-shrink-0 fs-5">✓</span>
                      <span>{t("chatbot.benefit6", "Multi-language interface, remembered permanently.")}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card mb-3 mb-md-4 shadow-sm">
                <div className="card-header bg-light d-flex align-items-center gap-2">
                  <div className="fs-4 fs-md-3">🚀</div>
                  <h3 className="h6 h-md-5 mb-0">{t("chatbot.howItHelpsTitle", "How It Helps You")}</h3>
                </div>
                <div className="card-body fade-slide">
                  <p className="mb-0">
                    {t("chatbot.howItHelpsDescription", "Just talk normally. The system watches for tasks, schedules, reminders, goals, and updates everything silently in the background. No command format needed.")}
                  </p>
                </div>
              </div>

              <div className="card mb-0 shadow-sm">
                <div className="card-header bg-light d-flex align-items-center gap-2">
                  <div className="fs-4 fs-md-3">🌐</div>
                  <h3 className="h6 h-md-5 mb-0">{t("chatbot.languageTitle", "Why Language Preference Matters")}</h3>
                </div>
                <div className="card-body fade-slide">
                  <p className="mb-0">
                    {t("chatbot.languageDescription", "Every answer adapts to your selected language. Your interface, bot messages, and todo summaries follow the same language for a consistent experience.")}
                  </p>
                </div>
              </div>

            </div>
          </section>
        )}

        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show m-2" role="alert" onClick={fetchChat}>
            <span className="me-2">⚠️</span>
            <span>{error}</span>
            <button type="button" className="btn-close" aria-label="Retry" onClick={fetchChat}></button>
          </div>
        )}

        
        {(sendProgress > 0 || conversationProgress > 0) && (
          <div className="chatbot-progress-section p-2">
            {sendProgress > 0 && (
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">{t("chatbot.sendingProgress", "Sending message...")}</span>
                  <span className="small">{Math.round(sendProgress)}%</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar"
                    style={{ width: `${sendProgress}%` }}
                    aria-valuenow={sendProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            )}
            {conversationProgress > 0 && (
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">{t("chatbot.conversationProgress", "Conversation Progress")}</span>
                  <span className="small">{Math.round(conversationProgress)}%</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar"
                    style={{ width: `${conversationProgress}%` }}
                    aria-valuenow={conversationProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    );

}
