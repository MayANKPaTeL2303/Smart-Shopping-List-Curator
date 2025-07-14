import React, { useState } from "react";

const getNumericPrice = (priceString) => {
  const num = parseFloat(priceString.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? Infinity : num;
};

function RecommendationList({ recommendations }) {
  const [sortBy, setSortBy] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");

  if (!recommendations || recommendations.length === 0) return null;

  const sortedRecommendations = recommendations.map((group) => {
    const sortedItems = [...group.items].sort((a, b) => {
      const priceA = getNumericPrice(a.price);
      const priceB = getNumericPrice(b.price);
      return sortBy === "asc" ? priceA - priceB : priceB - priceA;
    });

    return {
      category: group.category,
      items: sortedItems,
    };
  });

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#0071CE]">
          🧠 Smart Product Recommendations
        </h2>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071CE]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="border border-[#0071CE] text-[#0071CE] rounded px-3 py-1 text-sm hover:bg-[#0071CE] hover:text-white transition"
          >
            {viewMode === "grid" ? "🔃 Switch to List" : "🔃 Switch to Grid"}
          </button>
        </div>
      </div>

      {sortedRecommendations.map((group, idx) => (
        <div key={idx} className="mb-10">
          <h3 className="text-xl font-semibold text-[#0071CE] mb-2">
            {group.category}
          </h3>

          <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scroll-smooth">
            {group.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={`min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-md p-4 flex-shrink-0 hover:shadow-lg transition ${
                  viewMode === "grid" ? "w-[200px]" : "w-full"
                }`}
              >
                <div>
                  <h4 className="text-md font-semibold text-gray-900">
                    {item.name}
                  </h4>
                  {item.brand && (
                    <p className="text-sm text-gray-500">{item.brand}</p>
                  )}
                  <p className="text-[#000000] font-bold mt-1">
                    {item.price}
                  </p>
                  <div className="text-yellow-500 text-sm mt-1">
                    {renderStars(item.rating || Math.floor(Math.random() * 2) + 4)}
                    <span className="ml-2 text-gray-400 text-xs">
                      ({Math.floor(Math.random() * 90) + 10} reviews)
                    </span>
                  </div>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-[#0071CE] underline hover:text-blue-800"
                    >
                      View on Walmart
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderStars(rating = 4) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    );
  }
  return stars;
}

export default RecommendationList;
