import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import API from "../../utils/axiosClient";
import startAudioFile from "../../src/audio/start.mp3";
import tickAudioFile from "../../src/audio/tick.mp3";
import emptyAudioFile from "../../src/audio/empty.mp3";
import "../../css/game/dementiaChecker.css";

const LS_SESSION = "dementia_session_id";
const LS_ANSWERS = "dementia_answers";

function useCountdown(initialSec, running, onExpire) {
  const [seconds, setSeconds] = useState(initialSec);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (running) {
      setSeconds(initialSec);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(intervalRef.current);
            onExpireRef.current?.();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [initialSec, running]);

  return seconds;
}

function getQuestionVisibleMs(q) {
  const s = Number(q?.timeLimitSec) || 30;
  const ms = Math.floor((s / 3) * 1000);
  return Math.max(5000, Math.min(ms, 10000));
}

export default function DementiaChecker({ onFinish, onExit }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(
    localStorage.getItem(LS_SESSION) || ""
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  const [answers, setAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_ANSWERS) || "[]");
    } catch {
      return [];
    }
  });

  const [running, setRunning] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [showQuestion, setShowQuestion] = useState(true);
  const [cardStatus, setCardStatus] = useState("");

  const startAudioRef = useRef(new Audio(startAudioFile));
  const tickAudioRef = useRef(new Audio(tickAudioFile));
  const emptyAudioRef = useRef(new Audio(emptyAudioFile));

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioById, setAudioById] = useState({});

  const seconds = useCountdown(timeLimit, running, () => handleNext(true));

  useEffect(() => {
    if (running && seconds <= 5 && seconds > 0) {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play().catch(() => {});
    }
  }, [seconds, running]);

  useEffect(() => {
    setShowQuestion(true);
    const q = questions[currentIdx];
    const ms = getQuestionVisibleMs(q);
    const timer = setTimeout(() => setShowQuestion(false), ms);
    return () => clearTimeout(timer);
  }, [currentIdx, questions]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onExit?.();
      } else if (e.key === "Backspace" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA" && input.length > 0) {
        e.preventDefault();
        setInput(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input.length, onExit]);

  useEffect(() => {
    startAudioRef.current.preload = "auto";
    tickAudioRef.current.preload = "auto";
    emptyAudioRef.current.preload = "auto";

    const handleVisibility = () => {
      if (document.hidden) {
        [
          startAudioRef.current,
          tickAudioRef.current,
          emptyAudioRef.current,
        ].forEach((a) => {
          try {
            a.pause();
          } catch {}
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const persistAnswers = (next) => {
    setAnswers(next);
    localStorage.setItem(LS_ANSWERS, JSON.stringify(next));
  };

  const startTest = async () => {
    try {
      startAudioRef.current.currentTime = 0;
      startAudioRef.current.play().catch(() => {});

      setError(null);
      setLoading(true);

      const response = await API.dementia.getQuestions(difficulty);
      const responseData = response?.data || response;
      
      if (!response?.success || !responseData) {
        throw new Error(t("dementia.failedToLoadQuestions"));
      }

      setQuestions(responseData.questions || []);
      setSessionId(responseData.sessionId || "");
      localStorage.setItem(LS_SESSION, responseData.sessionId || "");

      setCurrentIdx(0);
      setInput("");
      setTimeLimit(responseData.questions?.[0]?.timeLimitSec || 30);
      setRunning(true);
      setCardStatus("");
      persistAnswers([]);
    } catch (e) {
      setError(
        e.message ||
          t("dementia.failedToStart", "Failed to start the test. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);

      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const qid = questions[currentIdx]?.id;

        if (qid) {
          setAudioById((prev) => ({ ...prev, [qid]: url }));
        }
      };

      mr.start();
      setIsRecording(true);
    } catch (e) {
      setError(
        e.message || t("dementia.microphonePermissionDenied")
      );
    }
  };

  const stopRecording = () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
    } catch {}
    setIsRecording(false);
  };

  const handleNext = (expired) => {
    if (!questions.length) return;
    if (isRecording) stopRecording();

    const q = questions[currentIdx];
    const answer = expired ? "" : input.trim();

    if (!answer) {
      emptyAudioRef.current.currentTime = 0;
      emptyAudioRef.current.play().catch(() => {});
      setCardStatus("empty");
    } else {
      setCardStatus("correct");
    }

    const next = [
      ...answers,
      {
        id: q.id,
        answer,
        durationSec: (q.timeLimitSec || timeLimit) - seconds,
      },
    ];

    persistAnswers(next);

    const nextIdx = currentIdx + 1;

    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setInput("");
      setTimeLimit(questions[nextIdx].timeLimitSec || 30);
      setRunning(true);
      setCardStatus("");
    } else {
      setRunning(false);
      setCardStatus("");
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const payload = { sessionId, answers };
      const res = await API.dementia.submit(payload);
      const responseData = res?.data || res;

      localStorage.removeItem(LS_SESSION);
      localStorage.removeItem(LS_ANSWERS);

      setSessionId("");
      setQuestions([]);
      setCurrentIdx(0);
      setInput("");
      setRunning(false);

      onFinish &&
        onFinish({
          key: "dementia_checker",
          score: Math.round((responseData.riskScore || 0) * 100),
          detail: {
            riskLevel: responseData.riskLevel,
            explanation: responseData.explanation,
            suggestions: responseData.suggestions || [],
          },
        });
    } catch (e) {
      setError(e.message || t("dementia.submissionError"));
    } finally {
      setLoading(false);
    }
  };

  const q = questions[currentIdx];

  return (
    <div className="game-wrapper">
      <h2
        style={{
          textAlign: "center",
          marginBottom: "16px",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {t("dementia.games.textRecall")}
      </h2>

      <header className="game-header">
        <h2>{t("dementia.title")}</h2>

        {!questions.length && (
          <div className="difficulty-selector">
            {["easy", "moderate", "hard"].map((d) => (
              <button
                key={d}
                className={`btn ${difficulty === d ? "btn-primary" : ""}`}
                onClick={() => setDifficulty(d)}
              >
                {t(`dementia.${d}`)}
              </button>
            ))}
          </div>
        )}

        {!questions.length ? (
          <button
            className="btn btn-primary start-btn"
            onClick={startTest}
            disabled={loading}
          >
            {loading ? t("dementia.starting") : t("dementia.start")}
          </button>
        ) : (
          <div className="timer">
            {t("dementia.timeLeft", { seconds })}
          </div>
        )}
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {questions.length > 0 && q && (
        <main className={`game-card ${cardStatus}`}>
          <div className="question-meta">
            {q.category && (
              <span className="badge">
                {t("dementia.category")}: {q.category}
              </span>
            )}
            {q.timeLimitSec && (
              <span className="badge">{q.timeLimitSec}s</span>
            )}
          </div>

          {showQuestion ? (
            <p className="question-text show">{q.text}</p>
          ) : (
            <p className="question-text hidden">
              {t("dementia.questionHidden")}
            </p>
          )}

          <textarea
            id="dementia-checker-input"
            name="dementia-checker-input"
            className="game-input"
            rows={3}
            placeholder={t("dementia.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && running && !loading) {
                e.preventDefault();
                handleNext(false);
              }
            }}
            disabled={!running}
            aria-label={t("dementia.placeholder")}
          />

          <div className="recording-controls">
            {!isRecording ? (
              <button
                className="btn"
                disabled={!running}
                onClick={startRecording}
                aria-label={t("dementia.record")}
              >
                {t("dementia.record")}
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={stopRecording}
                aria-label={t("dementia.stopRecording")}
              >
                {t("dementia.stopRecording")}
              </button>
            )}
            {isRecording && (
              <span className="recording-status" role="status">
                {t("dementia.recording")}
              </span>
            )}
          </div>

          <div className="game-actions">
            <button
              className="btn next-btn"
              onClick={() => handleNext(false)}
              disabled={!running}
              aria-label={t("dementia.next")}
            >
              {t("dementia.next")}
            </button>

            <button
              className="btn btn-secondary submit-btn"
              onClick={handleSubmit}
              disabled={loading || running}
              aria-label={t("dementia.submit")}
            >
              {t("dementia.submit")}
            </button>
          </div>

          <div className="game-progress">
            {t("dementia.progress", {
              current: currentIdx + 1,
              total: questions.length,
            })}
          </div>
        </main>
      )}

      {answers.length > 0 && (
        <aside className="game-summary">
          <h4>{t("dementia.draftTitle")}</h4>
          <ul>
            {answers.map((a, i) => (
              <li key={i}>
                <strong>{a.id}:</strong>{" "}
                {a.answer || (
                  <span className="empty-answer-text">
                    {t("dementia.emptyAnswer")}
                  </span>
                )}{" "}
                <em>({a.durationSec || 0}s)</em>
                {audioById[a.id] && (
                  <audio controls src={audioById[a.id]} aria-label={t("dementia.hasAudio")} />
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: 12 }}
      >
        <button
          className="btn btn-outline-secondary"
          onClick={() => onExit && onExit()}
          aria-label={t("dementia.exit")}
        >
          {t("dementia.exit")}
        </button>
      </div>
    </div>
  );
}