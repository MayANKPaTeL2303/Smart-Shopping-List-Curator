// src/App.jsx
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [inputText, setInputText] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter items like: milk, shampoo, rice"
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          ></textarea>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              type="button"
              onClick={() => alert("Voice input coming soon")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🎤 Voice Input
            </button>

            <button
              type="button"
              onClick={() => alert("Image OCR coming soon")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🖼️ Upload Image
            </button>

            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="text-red-600 font-semibold text-center mb-4">
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
                  className="border border-gray-300 p-4 rounded-lg bg-gray-50"
                >
                  <p className="font-bold text-indigo-600">{item.name}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                    {Array.isArray(item.recommendations) &&
                    item.recommendations.length > 0 ? (
                      item.recommendations.map((rec, ridx) => (
                        <li key={ridx}>
                          {rec.name} – {rec.price} ({rec.brand})
                        </li>
                      ))
                    ) : (
                      <li>No recommendations found.</li>
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
