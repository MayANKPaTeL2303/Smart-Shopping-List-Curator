// src/App.jsx
import React, { useState } from "react";
import axios from "axios";
import useVoiceTyping from "./components/useVoiceTyping";
import RecommendationList from "./components/RecommendationList";
import UploadImageButton from "./components/UploadImageButton";

function App() {
  const [inputText, setInputText] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleVoiceTextUpdate = (text) => {
    setInputText(text);
  };

  const {
    isListening,
    error: voiceError,
    toggleListening,
  } = useVoiceTyping(handleVoiceTextUpdate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("items", inputText);
      if (uploadedImage) {
        formData.append("image", uploadedImage);
      }

      const res = await axios.post("http://127.0.0.1:8000/process/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && Array.isArray(res.data.items)) {
        const withImages = res.data.items.map((item) => ({
          ...item,
          recommendations: item.recommendations.map((rec) => ({
            ...rec,
            image: `https://source.unsplash.com/80x80/?${rec.name
              .split(" ")
              .join(",")}`,
          })),
        }));
        setRecommendations(withImages);
      } else {
        setRecommendations([]);
        setErrorMsg("Invalid response from server.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to fetch recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          🛒 AI-Powered Shopping List Curator
        </h1>

        <label
          htmlFor="itemsInput"
          className="block font-medium text-gray-700 mb-1"
        >
          Enter items or use voice:
        </label>
        <textarea
          id="itemsInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. milk, shampoo, rice"
          rows="4"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {isListening && (
          <div className="text-green-600 text-sm mb-2 flex items-center animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Listening... Speak now
          </div>
        )}

        {voiceError && (
          <div className="text-red-600 text-sm mb-4 p-2 bg-red-100 rounded border border-red-300">
            {voiceError}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`px-4 py-2 rounded transition-all duration-300 flex items-center gap-2 text-white ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isListening ? "🛑 Stop Listening" : "🎤 Start Speaking"}
          </button>

          <UploadImageButton setUploadedImage={setUploadedImage} />

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || (!inputText.trim() && !uploadedImage)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "🔄 Loading..." : "🚀 Submit"}
          </button>
        </div>

        {uploadedImage && (
          <div className="mt-4 relative inline-block">
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Uploaded Preview"
              className="max-w-xs rounded shadow-lg mb-4"
            />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute top-0 right-0 bg-white-500 text-white rounded-full px-2 py-1 text-xs hover:bg-black-600 shadow-md"
              title="Remove image"
            >
              ❌
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="text-red-600 font-semibold text-center mb-4 p-3 bg-red-100 rounded border border-red-300">
            {errorMsg}
          </div>
        )}

        <RecommendationList recommendations={recommendations} />
      </div>
    </div>
  );
}

export default App;
