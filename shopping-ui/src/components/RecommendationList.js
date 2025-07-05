// src/components/RecommendationList.jsx
import React, { useState } from "react";

const getNumericPrice = (priceString) => {
  const num = parseFloat(priceString.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? Infinity : num;
};

const RecommendationList = ({ recommendations }) => {
  const [sortBy, setSortBy] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  if (!recommendations || recommendations.length === 0) return null;

  const sortedRecommendations = recommendations.map((item) => {
    const sortedRecs = [...item.recommendations].sort((a, b) => {
      const priceA = getNumericPrice(a.price);
      const priceB = getNumericPrice(b.price);
      return sortBy === "asc" ? priceA - priceB : priceB - priceA;
    });
    return { ...item, recommendations: sortedRecs };
  });

  const renderStars = (rating = 4) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-800">
          🧠 Top Recommendations
        </h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Sort by Price:</label>
          <select
            className="border rounded px-2 py-1 text-sm text-gray-700"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="ml-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
          >
            {viewMode === "grid" ? "🔃 Switch to List" : "🔃 Switch to Grid"}
          </button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-1 md:grid-cols-3" : "flex flex-col gap-4"}>
        {sortedRecommendations.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-300 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h3 className="text-lg font-bold text-indigo-700 mb-3 border-b pb-1">
              {item.name}
            </h3>

            {item.recommendations.length > 0 ? (
              <div className="space-y-4">
                {item.recommendations.map((rec, ridx) => (
                  <div
                    key={ridx}
                    className={`p-2 rounded-lg hover:bg-gray-100 transition ${viewMode === "grid" ? "flex items-center space-x-4" : "block"}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {rec.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {rec.brand}
                      </p>
                      <p className="text-green-600 font-semibold">
                        {rec.price}
                      </p>
                      <div className="text-yellow-500 text-sm">
                        {renderStars(rec.rating || Math.floor(Math.random() * 2) + 4)}
                        <span className="ml-2 text-gray-400">({Math.floor(Math.random() * 100) + 10} reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recommendations found.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;
