// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const useVoiceTyping = (onTextUpdate) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");

  useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Set up event handlers
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

      // Update the text with final + interim results
      onTextUpdate(finalTranscriptRef.current + interimTranscriptRef.current);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      // Only set to false if we're not manually stopping
      if (isListening) {
        setIsListening(false);
      }
      
      // Clean up interim transcript, keep only final
      if (finalTranscriptRef.current) {
        onTextUpdate(finalTranscriptRef.current.trim());
        finalTranscriptRef.current = "";
        interimTranscriptRef.current = "";
      }
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Speech recognition error: ';
      switch(event.error) {
        case 'no-speech':
          errorMessage += 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage += 'No microphone found or access denied.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage += 'Network error occurred.';
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
      setError('Speech recognition not initialized.');
      return;
    }

    try {
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      recognitionRef.current.start();
    } catch (error) {
      setError('Failed to start speech recognition: ' + error.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
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
    stopListening
  };
};

function App() {
  const [inputText, setInputText] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVoiceTextUpdate = (text) => {
    setInputText(text);
  };

  const { isListening, error: voiceError, toggleListening } = useVoiceTyping(handleVoiceTextUpdate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/process/", {
        items: inputText,
      });

      if (res.data && Array.isArray(res.data.items)) {
        setRecommendations(res.data.items);
      } else {
        setRecommendations([]);
        setErrorMsg("Invalid response from server.");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setErrorMsg("Failed to fetch recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          🛒 AI-Powered Shopping List Curator
        </h1>

        <div className="mb-6">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter items like: milk, shampoo, rice, or click the microphone to speak..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Voice Status */}
          {isListening && (
            <div className="text-green-600 text-sm mb-2 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Listening... Speak now
            </div>
          )}

          {/* Voice Error */}
          {voiceError && (
            <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded border border-red-200">
              {voiceError}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2 rounded transition-colors duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isListening ? '🎤 Stop Listening' : '🎤 Voice Input'}
            </button>

            <button
              type="button"
              onClick={() => alert("Image OCR coming soon")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              🖼️ Upload Image
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !inputText.trim()}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="text-red-600 font-semibold text-center mb-4 p-3 bg-red-50 rounded border border-red-200">
            {errorMsg}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Top Recommendations
            </h2>
            <ul className="space-y-4">
              {recommendations.map((item, idx) => (
                <li
                  key={idx}
                  className="border border-gray-300 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <p className="font-bold text-indigo-600 mb-2">{item.name}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {Array.isArray(item.recommendations) &&
                    item.recommendations.length > 0 ? (
                      item.recommendations.map((rec, ridx) => (
                        <li key={ridx} className="hover:text-gray-900 transition-colors duration-200">
                          <span className="font-medium">{rec.name}</span> – 
                          <span className="text-green-600 font-semibold"> {rec.price}</span> 
                          <span className="text-gray-500"> ({rec.brand})</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No recommendations found.</li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;