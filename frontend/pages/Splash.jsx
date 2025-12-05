import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/pages/Splash.css";


const DESKTOP_BREAKPOINT = 1024;
const VIDEO_VERSION = "v2.0";
const SKIP_BUTTON_DELAY = 5000; 
const SKIP_BUTTON_PERCENTAGE = 0.1; 
const FADE_OUT_DURATION = 600;
const NAVIGATION_DELAY = 1200;
const LOADING_UPDATE_INTERVAL = 100;
const PROGRESS_UPDATE_INTERVAL = 100;


const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getVideoSrc = (isDesktop, version = VIDEO_VERSION) => {
  const baseSrc = isDesktop ? "/videos/splashd.MP4" : "/videos/splash.MP4";
  return `${baseSrc}?v=${version}`;
};

const calculateBufferedProgress = (video) => {
  if (!video || !video.buffered.length || !video.duration) return 0;
  const bufferedEnd = video.buffered.end(video.buffered.length - 1);
  return Math.min(100, (bufferedEnd / video.duration) * 100);
};

const calculateVideoProgress = (video) => {
  if (!video || !video.duration || video.currentTime === undefined) return 0;
  return (video.currentTime / video.duration) * 100;
};

export default function Splash() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= DESKTOP_BREAKPOINT);
  const [started, setStarted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isMuted, setIsMuted] = useState(() => window.innerWidth < DESKTOP_BREAKPOINT);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  
  const videoRef = useRef(null);
  const loadingIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const skipButtonTimeoutRef = useRef(null);
  
  
  const videoSrc = useMemo(() => getVideoSrc(isDesktop), [isDesktop]);

  
  useEffect(() => {
    const handleResize = () => {
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        const newIsDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
        const prevIsDesktop = isDesktop;
        
        if (newIsDesktop !== prevIsDesktop) {
          setIsDesktop(newIsDesktop);
          
          
          if (videoRef.current && started && !videoError && videoReady) {
            const video = videoRef.current;
            
            
            if (!video.parentNode || !document.contains(video)) {
              return; 
            }
            
            const wasPlaying = !video.paused;
            const currentTime = video.currentTime;
            const newSrc = getVideoSrc(newIsDesktop);
            const currentSrc = video.src || video.currentSrc || '';
            const currentBaseSrc = currentSrc.split('?')[0].replace(window.location.origin, '');
            const newBaseSrc = newSrc.split('?')[0];
            
            if (currentBaseSrc !== newBaseSrc) {
              try {
                video.src = newSrc;
                video.load();
                
                if (wasPlaying) {
                  
                  const resumePlayback = () => {
                    if (!video || !document.contains(video)) return;
                    try {
                      video.currentTime = Math.min(currentTime, video.duration || currentTime);
                      video.play().catch((err) => {
                        
                        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                          if (import.meta.env.DEV) {
                          }
                        }
                        
                      });
                    } catch (playErr) {
                      
                      if (playErr.name !== 'AbortError' && playErr.name !== 'NotAllowedError') {
                        if (import.meta.env.DEV) {
                        }
                      }
                    }
                  };
                  
                  if (video.readyState >= 3) {
                    resumePlayback();
                  } else {
                    video.addEventListener('canplay', resumePlayback, { once: true });
                  }
                }
              } catch (err) {
                
                if (err.name !== 'AbortError' && err.name !== 'InvalidStateError') {
                }
              }
            }
            
            
            if (newIsDesktop && !prevIsDesktop) {
              
              if (video && document.contains(video)) {
                video.muted = false;
                setIsMuted(false);
              }
            } else if (!newIsDesktop && prevIsDesktop) {
              
              if (video && document.contains(video)) {
                video.muted = true;
                setIsMuted(true);
              }
            }
          }
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [started, videoError, isDesktop, videoReady]);

  
  useEffect(() => {
    if (!started || videoError) return;
    
    const video = videoRef.current;
    if (!video) return;

    setVideoLoading(true);
    setLoadingProgress(0);

    
    const updateLoadingProgress = () => {
      const progress = calculateBufferedProgress(video);
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        if (loadingIntervalRef.current) {
          clearInterval(loadingIntervalRef.current);
          loadingIntervalRef.current = null;
        }
      }
    };

    loadingIntervalRef.current = setInterval(updateLoadingProgress, LOADING_UPDATE_INTERVAL);

    
    const handleLoadedMetadata = () => {
      if (video.duration) {
        setVideoDuration(video.duration);
        setVideoReady(true);
        
        
        const skipDelay = Math.min(SKIP_BUTTON_DELAY, video.duration * SKIP_BUTTON_PERCENTAGE * 1000);
        skipButtonTimeoutRef.current = setTimeout(() => {
          setShowSkipButton(true);
        }, skipDelay);
      }
    };

    const handleTimeUpdate = () => {
      const progress = calculateVideoProgress(video);
      setVideoProgress(progress);
    };

    const handleCanPlay = () => {
      setVideoLoading(false);
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleLoadedData = () => {
      updateLoadingProgress();
    };

    const handleProgress = () => {
      updateLoadingProgress();
    };

    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }
    if (video.readyState >= 3) {
      handleCanPlay();
    }

        
    const playVideo = async () => {
      
      if (!video || !document.contains(video)) {
        return;
      }
      
      try {
        if (isDesktop) {
          
          video.muted = false;
          try {
            await video.play();
            setAudioEnabled(true);
            setIsMuted(false);
            setIsPlaying(true);
          } catch (audioErr) {
            
            if (audioErr.name === 'AbortError') {
              return; 
            }
            
            if (video && document.contains(video)) {
              video.muted = true;
              setIsMuted(true);
              await video.play();
              setIsPlaying(true);
            }
          }
        } else {
          
          video.muted = true;
          setIsMuted(true);
          await video.play();
          setIsPlaying(true);
        }
      } catch (err) {
        
        if (err.name === 'AbortError') {
          return; 
        }
        
        if (err.name !== 'NotAllowedError') {
        }
        
        if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
          setVideoError(true);
        }
        setVideoLoading(false);
        setIsPlaying(false);
      }
    };

    playVideo();

    
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      if (skipButtonTimeoutRef.current) {
        clearTimeout(skipButtonTimeoutRef.current);
        skipButtonTimeoutRef.current = null;
      }
      
      
      if (video && document.contains(video)) {
        try {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('progress', handleProgress);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          
          if (!video.paused) {
            video.pause();
          }
        } catch (err) {
          
        }
      }
    };
  }, [started, videoError, isDesktop]);

  
  const navigateToDashboard = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    setFadeOut(true);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
  }, [isNavigating]);

  
  const handleStart = useCallback(() => {
    try {
      localStorage.setItem("seenSplash", "true");
      setStarted(true);
    } catch (err) {
      setStarted(true);
    }
  }, []);

  const handleSkip = useCallback(() => {
    navigateToDashboard();
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, FADE_OUT_DURATION);
  }, [navigate, navigateToDashboard]);

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const newMutedState = !video.muted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);
    
    
    if (!newMutedState && !audioEnabled) {
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  const handleTogglePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.contains(video)) return;
    
    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
      }
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    navigateToDashboard();
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, NAVIGATION_DELAY);
  }, [navigate, navigateToDashboard]);

  const handleVideoError = useCallback((e) => {
    
    const video = e.target;
    if (video && video.error) {
      const errorCode = video.error.code;
      
      switch (errorCode) {
        case MediaError.MEDIA_ERR_ABORTED:
          
          if (import.meta.env.DEV) {
          }
          return; 
        case MediaError.MEDIA_ERR_NETWORK:
          
          if (import.meta.env.DEV) {
          }
          
          setTimeout(() => {
            if (video && document.contains(video)) {
              const currentSrc = video.src;
              video.src = '';
              video.load();
              setTimeout(() => {
                if (video && document.contains(video)) {
                  video.src = currentSrc;
                  video.load();
                }
              }, 100);
            }
          }, 500);
          return; 
        case MediaError.MEDIA_ERR_DECODE:
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          break;
        default:
      }
    } else {
      
    }
    setVideoError(true);
    setVideoLoading(false);
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  }, []);

  
  if (!started) {
    return (
      <div className={`splash-container position-relative w-100 h-100 ${fadeOut ? "fade-out" : ""}`}>
        <div 
          className="splash-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4"
          role="main"
          aria-label={t("splash.welcomeScreen", "Welcome to Maitri")}
        >
          <div className="splash-logo-container mb-4 mb-md-5">
            <h1 className="splash-text display-1 fw-bold text-white mb-3 mb-md-4">
              MAITRI
            </h1>
            <div className="splash-logo-decoration mx-auto" aria-hidden="true"></div>
          </div>
          <p 
            className="splash-subtext lead text-white mb-4 mb-md-5 mx-auto" 
            style={{ 
              maxWidth: isDesktop ? "600px" : "90%",
              padding: isDesktop ? "0" : "0 1rem"
            }}
          >
            {t("splash.tagline", "Not just a chatbot — a safe, warm space for your well-being.")}
          </p>
          <button 
            className="splash-btn btn btn-primary btn-lg px-5 py-3" 
            onClick={handleStart}
            aria-label={t("splash.startButton", "Tap to Start")}
            autoFocus={isDesktop}
            style={{
              minHeight: isDesktop ? undefined : "48px",
              minWidth: isDesktop ? undefined : "200px"
            }}
          >
            <span className="d-flex align-items-center gap-2">
              <span>{t("splash.startButton", "Tap to Start")}</span>
              <i className="bi bi-play-fill" aria-hidden="true"></i>
            </span>
          </button>
        </div>
      </div>
    );
  }

  
  if (videoError) {
    return (
      <div className={`splash-container position-relative w-100 h-100 ${fadeOut ? "fade-out" : ""}`}>
        <div 
          className="splash-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4"
          role="main"
          aria-label={t("splash.welcomeScreen", "Welcome to Maitri")}
        >
          <div className="splash-logo-container mb-4 mb-md-5">
            <h1 className="splash-text display-1 fw-bold text-white mb-3 mb-md-4">
              MAITRI
            </h1>
          </div>
          <p 
            className="splash-subtext lead text-white mb-4 mb-md-5 mx-auto" 
            style={{ 
              maxWidth: isDesktop ? "600px" : "90%",
              padding: isDesktop ? "0" : "0 1rem"
            }}
          >
            {t("splash.welcome", "Welcome — supporting your well-being every step of the way.")}
          </p>
          <button 
            className="splash-btn btn btn-primary btn-lg px-5 py-3" 
            onClick={handleSkip}
            aria-label={t("splash.continue", "Continue")}
            style={{
              minHeight: isDesktop ? undefined : "48px",
              minWidth: isDesktop ? undefined : "200px"
            }}
          >
            <span className="d-flex align-items-center gap-2">
              <span>{t("splash.continue", "Continue")}</span>
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </span>
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className={`splash-container position-relative w-100 h-100 ${fadeOut ? "fade-out" : ""}`}>
      
      <div 
        className="position-absolute top-0 end-0 p-3 p-md-4"
        style={{
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="text-white text-end"
          style={{
            fontSize: isDesktop ? "0.875rem" : "0.75rem",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
            opacity: 0.9
          }}
        >
          <div style={{ fontWeight: "500" }}>Video Credit:</div>
          <div>
            {isDesktop ? (
              <a 
                href="https://www.youtube.com/@alzheimerssociety" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white text-decoration-none"
                style={{
                  pointerEvents: 'auto',
                  textDecoration: 'underline',
                  textDecorationThickness: '1px',
                  textUnderlineOffset: '2px'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.9'}
              >
                Alzheimer's Society
              </a>
            ) : (
              <a 
                href="https://pin.it/vu3rcOvSn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white text-decoration-none"
                style={{
                  pointerEvents: 'auto',
                  textDecoration: 'underline',
                  textDecorationThickness: '1px',
                  textUnderlineOffset: '2px'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.9'}
              >
                Sabina Moreau
              </a>
            )}
          </div>
        </div>
      </div>
      <video
        ref={videoRef}
        className="splash-video"
        src={videoSrc}
        muted={isMuted}
        playsInline
        autoPlay
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        key={`${isDesktop ? "desktop" : "mobile"}-${VIDEO_VERSION}`}
        preload="auto"
        aria-label={t("splash.videoLabel", "Maitri introduction video")}
        onAbort={(e) => {
          if (import.meta.env.DEV) {
          }
        }}
      />
      
      {videoLoading && (
        <div 
          className="splash-loading position-absolute top-50 start-50 translate-middle text-center text-white"
          role="status"
          aria-live="polite"
          aria-label={t("splash.loading", "Loading video")}
          style={{
            padding: isDesktop ? "1.5rem" : "1rem",
            maxWidth: isDesktop ? "280px" : "240px",
            width: "auto"
          }}
        >
          <div 
            className="spinner-border text-light mb-3" 
            style={{ 
              width: isDesktop ? "2rem" : "1.75rem", 
              height: isDesktop ? "2rem" : "1.75rem" 
            }} 
            role="status"
            aria-hidden="true"
          >
            <span className="visually-hidden">{t("splash.loading", "Loading...")}</span>
          </div>
          <div 
            className="progress mb-2" 
            style={{ 
              width: isDesktop ? "240px" : "200px", 
              maxWidth: "85vw", 
              height: isDesktop ? "6px" : "5px",
              minWidth: isDesktop ? "240px" : "180px"
            }}
            role="progressbar"
            aria-valuenow={Math.round(loadingProgress)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`${t("splash.loading", "Loading")} ${Math.round(loadingProgress)}%`}
          >
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-light"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className={`loading-text mb-0 ${isDesktop ? "small" : "small"}`} style={{ fontSize: isDesktop ? "0.875rem" : "0.8125rem" }}>
            {t("splash.loading", "Loading...")} {Math.round(loadingProgress)}%
          </p>
        </div>
      )}
      
      {videoReady && !videoLoading && (
        <div 
          className="splash-video-controls position-absolute bottom-0 start-0 w-100 p-3 p-md-4"
          role="toolbar"
          aria-label={t("splash.videoControls", "Video controls")}
        >
          <div className={`d-flex ${isDesktop ? "justify-content-between" : "justify-content-end"} align-items-center mb-3 mb-md-2 gap-3 flex-wrap`}>
            <div className="d-flex gap-2 align-items-center">
              <button 
                className="play-pause-btn btn btn-outline-light btn-sm d-flex align-items-center justify-content-center" 
                onClick={handleTogglePlayPause}
                aria-label={isPlaying ? t("splash.pause", "Pause video") : t("splash.play", "Play video")}
                style={{ 
                  width: isDesktop ? "40px" : "44px", 
                  height: isDesktop ? "40px" : "44px", 
                  borderRadius: "50%",
                  minWidth: isDesktop ? "40px" : "44px",
                  minHeight: isDesktop ? "40px" : "44px"
                }}
                type="button"
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width={isDesktop ? "20" : "18"} height={isDesktop ? "20" : "18"} aria-hidden="true">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width={isDesktop ? "20" : "18"} height={isDesktop ? "20" : "18"} aria-hidden="true">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
            {showSkipButton && (
              <button 
                className="skip-btn btn btn-light btn-sm px-3 px-md-4" 
                onClick={handleSkip}
                aria-label={t("splash.skip", "Skip intro")}
                type="button"
                style={{
                  minHeight: "44px",
                  fontSize: isDesktop ? undefined : "0.875rem"
                }}
              >
                <span className="d-flex align-items-center gap-2">
                  <span>{t("splash.skip", "Skip Intro")}</span>
                  <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </span>
              </button>
            )}
          </div>
          
          {videoDuration > 0 && (
            <div className="video-progress-container">
              <div 
                className="progress mb-2" 
                style={{ 
                  height: isDesktop ? "6px" : "5px", 
                  backgroundColor: "rgba(255, 255, 255, 0.3)" 
                }}
                role="progressbar"
                aria-valuenow={Math.round(videoProgress)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={t("splash.videoProgress", "Video progress")}
              >
                <div 
                  className="progress-bar bg-white" 
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>
              <div className={`video-time-info d-flex justify-content-between align-items-center text-white ${isDesktop ? "small" : ""}`}>
                <span className="video-time-current" aria-label={t("splash.currentTime", "Current time")}>
                  {formatTime(videoRef.current?.currentTime || 0)}
                </span>
                <span className="video-time-separator" aria-hidden="true">/</span>
                <span className="video-time-total" aria-label={t("splash.totalTime", "Total time")}>
                  {formatTime(videoDuration)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
