import React, { useState } from "react";
import axios from "axios";
import useVoiceTyping from "./components/useVoiceTyping";
import UploadImageButton from "./components/UploadImageButton";
import RecommendationList from "./components/RecommendationList";

function App() {
  const [inputText, setInputText] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVoiceTextUpdate = (text) => setInputText(text);

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
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && Array.isArray(res.data.items)) {
        const withImages = res.data.items.map((item) => ({
          category: item.name,
          items: item.recommendations.map((rec) => ({
            name: rec.name,
            price: rec.price,
            link: rec.link,
          })),
        }));
        setRecommendations(withImages);
      } else {
        setErrorMsg("Invalid response from server.");
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setErrorMsg("Failed to fetch recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl text-white">🛒</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Smart Shopping Assistant
          </h1>
          <p className="text-gray-600 mt-2">AI-powered shopping list curator with intelligent recommendations</p>
        </div>

        {/* Text Input */}
        <label
          htmlFor="itemsInput"
          className="block text-gray-700 font-medium mb-2"
        >
          Enter items or use voice:
        </label>

        <textarea
          id="itemsInput"
          rows="4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. milk, rice, shampoo, or describe what you need..."
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
        />

        {/* Voice Listening Status */}
        {isListening && (
          <div className="text-green-600 text-sm mb-2 flex items-center animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Listening... Speak now
          </div>
        )}

        {/* Voice Error */}
        {voiceError && (
          <div className="text-red-600 bg-red-100 border border-red-300 p-2 rounded text-sm mb-4">
            {voiceError}
          </div>
        )}

        {/* Button Row */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isListening
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            }`}
          >
            {isListening ? "🛑 Stop Listening" : "🎤 Start Speaking"}
          </button>

          <UploadImageButton setUploadedImage={setUploadedImage} />

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || (!inputText.trim() && !uploadedImage)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
          >
            {loading ? "🔄 Processing..." : "✨ Get Recommendations"}
          </button>
        </div>

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="relative inline-block mt-4">
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Preview"
              className="max-w-xs rounded shadow-md mb-4"
            />
            <button
              onClick={() => setUploadedImage(null)}
              title="Remove image"
              className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-full hover:bg-opacity-80"
            >
              ❌
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="text-red-600 font-semibold text-center mb-4 p-3 bg-red-100 border border-red-300 rounded">
            {errorMsg}
          </div>
        )}

        {/* Output List */}
        <RecommendationList recommendations={recommendations} />
      </div>
    </div>
  );
}

export default App;
