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
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
        {/* Walmart Branding Header */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/2560px-Walmart_logo.svg.png"
            alt="Walmart Logo"
            className="h-10"
          />
          <h1 className="text-3xl font-bold text-[#0071CE] text-center">
            AI-Powered Shopping List Curator
          </h1>
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
          placeholder="e.g. milk, rice, shampoo"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071CE] mb-4"
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
            className={`px-4 py-2 rounded text-white font-semibold flex items-center gap-2 transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-[#0071CE] hover:bg-blue-800"
            }`}
          >
            {isListening ? "🛑 Stop Listening" : "🎤 Start Speaking"}
          </button>

          <UploadImageButton setUploadedImage={setUploadedImage} />

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || (!inputText.trim() && !uploadedImage)}
            className="bg-[#FFC220] hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "🔄 Loading..." : "🚀 Submit"}
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
