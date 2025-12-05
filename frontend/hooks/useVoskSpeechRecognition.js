import { useState, useEffect, useRef, useCallback } from 'react';


export const useVoskSpeechRecognition = (options = {}) => {
  const {
    clearTranscriptOnListen = false,
    continuous = true,
    interimResults = true,
    language = 'en-US'
  } = options;

  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isSupportedRef = useRef(false);
  const isStartingRef = useRef(false);
  const recognitionStateRef = useRef('idle'); 

  
  useEffect(() => {
    if (typeof window === 'undefined') {
      isSupportedRef.current = false;
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    isSupportedRef.current = !!SpeechRecognition;

    
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptText = '';

        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptText += transcriptText + ' ';
          } else {
            interimTranscript += transcriptText;
          }
        }

        console.log('🎯 onresult called - Final:', finalTranscriptText, 'Interim:', interimTranscript);

        
        if (finalTranscriptText) {
          
          setFinalTranscript(prev => {
            const newFinal = (prev + finalTranscriptText).trim();
            setTranscript(newFinal);
            console.log('✅ Final transcript:', newFinal);
            return newFinal;
          });
        }
        
        if (interimTranscript) {
          
          setFinalTranscript(prevFinal => {
            const combined = (prevFinal + interimTranscript).trim();
            setTranscript(combined);
            console.log('📝 Interim + Final:', combined);
            return prevFinal; 
          });
        }
      };

      
      recognition.onerror = (event) => {
        let errorState = 'unknown';
        try {
          errorState = recognition.state || 'unknown';
        } catch (e) {
          
        }
        console.error('❌ Speech recognition error:', event.error, 'State:', errorState);
        setError(event.error);
        setListening(false);
        isStartingRef.current = false;
        
        
        if (event.error === 'no-speech') {
          console.log('ℹ️ No speech detected, continuing...');
          
        } else if (event.error === 'aborted') {
          console.log('ℹ️ Recognition aborted');
          recognitionStateRef.current = 'idle';
        } else {
          
          recognitionStateRef.current = 'idle';
        }
      };

      
      recognition.onend = () => {
        let endState = 'unknown';
        try {
          endState = recognition.state || 'unknown';
        } catch (e) {
          
        }
        console.log('🔚 Speech recognition ended, state:', endState);
        setListening(false);
        isStartingRef.current = false;
        recognitionStateRef.current = 'idle';
        setError(null);
      };

      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started successfully');
        setListening(true);
        isStartingRef.current = false;
        recognitionStateRef.current = 'listening';
        setError(null);
      };
    }
  }, [continuous, interimResults, language]);

  const startListening = useCallback(() => {
    if (!isSupportedRef.current || !recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = recognitionRef.current;

    
    const currentState = recognitionStateRef.current;
    
    
    let recognitionState = null;
    try {
      if (typeof recognition.state !== 'undefined') {
        recognitionState = recognition.state;
      }
    } catch (e) {
      
      recognitionState = null;
    }

    
    
    if (listening) {
      console.warn('⚠️ Already listening (from React state), ignoring start request');
      return;
    }

    
    if (isStartingRef.current) {
      console.warn('⚠️ Start already in progress, ignoring duplicate call...');
      return;
    }

    
    if (currentState === 'listening' || currentState === 'starting') {
      console.warn('⚠️ Recognition already active (ref state:', currentState + ') - ignoring start');
      return;
    }

    
    if (recognitionState && (recognitionState === 'listening' || recognitionState === 'starting')) {
      console.warn('⚠️ Recognition already active (recognition.state:', recognitionState + ') - ignoring start');
      recognitionStateRef.current = 'listening';
      setListening(true);
      return;
    }

    
    isStartingRef.current = true;
    recognitionStateRef.current = 'starting';

    try {
      
      if (clearTranscriptOnListen) {
        setTranscript('');
        setFinalTranscript('');
      }
      
      
      recognition.start();
      console.log('✅ Started recognition.start() - will wait for onstart event');
      
    } catch (err) {
      
      isStartingRef.current = false;
      
      console.error('❌ Error starting speech recognition:', err.name, err.message);
      
      
      if (err.name === 'InvalidStateError' || (err.message && err.message.includes('already started'))) {
        console.warn('⚠️ Recognition already started - updating state to listening');
        recognitionStateRef.current = 'listening';
        setListening(true);
        
      } else {
        recognitionStateRef.current = 'idle';
        setError(err.message || 'Failed to start speech recognition');
      }
    }
  }, [clearTranscriptOnListen, listening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      setListening(false);
      recognitionStateRef.current = 'idle';
      isStartingRef.current = false;
      return;
    }

    const recognition = recognitionRef.current;
    const currentState = recognitionStateRef.current;
    
    
    let recognitionState = null;
    try {
      recognitionState = recognition.state;
    } catch (e) {
      
      recognitionState = null;
    }
    
    
    if (currentState === 'listening' || currentState === 'starting' || 
        (recognitionState && (recognitionState === 'listening' || recognitionState === 'starting'))) {
      
      recognitionStateRef.current = 'stopping';
      isStartingRef.current = false;
      
      try {
        recognition.stop();
        console.log('🛑 Stopping speech recognition, state:', recognitionState || currentState);
      } catch (err) {
        console.error('❌ Error stopping speech recognition:', err);
        
        setListening(false);
        recognitionStateRef.current = 'idle';
        isStartingRef.current = false;
      }
    } else {
      
      console.log('ℹ️ Already stopped, state:', currentState);
      setListening(false);
      recognitionStateRef.current = 'idle';
      isStartingRef.current = false;
    }
  }, [listening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  const browserSupportsSpeechRecognition = isSupportedRef.current;
  const isMicrophoneAvailable = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia;

  return {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    error
  };
};

export default useVoskSpeechRecognition;


