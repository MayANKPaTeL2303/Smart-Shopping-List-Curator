import { useState, useEffect, useRef } from "react";

const useVoiceTyping = (onTextUpdate) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const manuallyStoppedRef = useRef(false);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current += finalTranscript;
      interimTranscriptRef.current = interimTranscript;

      if (!manuallyStoppedRef.current) {
        onTextUpdate(finalTranscriptRef.current + interimTranscriptRef.current);
      }
    };

    recognition.onend = () => {
      if (manuallyStoppedRef.current) {
        manuallyStoppedRef.current = false;
        setIsListening(false);
        return;
      }

      if (finalTranscriptRef.current && !manuallyStoppedRef.current) {
        onTextUpdate(finalTranscriptRef.current.trim());
        finalTranscriptRef.current = "";
        interimTranscriptRef.current = "";
      }

      // Auto-restart if speech ends naturally
      recognition.start();
    };

    recognition.onerror = (event) => {
      let errorMessage = "Speech recognition error: ";
      switch (event.error) {
        case "no-speech":
          errorMessage += "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage += "No microphone found or access denied.";
          break;
        case "not-allowed":
          errorMessage += "Microphone access denied.";
          break;
        case "network":
          errorMessage += "Network error occurred.";
          break;
        default:
          errorMessage += event.error;
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTextUpdate]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not initialized.");
      return;
    }

    try {
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      manuallyStoppedRef.current = false;
      recognitionRef.current.start();
    } catch (error) {
      setError("Failed to start speech recognition: " + error.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    error,
    toggleListening,
    startListening,
    stopListening,
  };
};

export default useVoiceTyping;
